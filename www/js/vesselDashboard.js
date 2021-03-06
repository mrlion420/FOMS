$(document).ready(function () {
    mainFunction();
});

// Page Global
var SELECTED_ENGINE_TYPE = null;
var SELECTED_POSITION_QUERY = "24";
var CHART_INTERVAL = null;
var MAP_INTERVAL = null;

async function mainFunction() {
    isGlobalJSLoaded();
    showMainLoader();
        
    await getUserRelatedFleets();
    await getUserRelatedVessels();

    await getAllEngineTypes();
    await initMap("map");
    getLastOperationMode();
    generateStaticMapFromQueryTime();
    setLabels();
    getRecentEventList();
    getRecentDistance();
    getRecentPosition();
    getEngineTotalAndEstConsumption();
    await createEngineChartByEngineType();

    selectDropdownChangeEvent();
    submitBtnClickHandler();

    hideMainLoader();
}

function isGlobalJSLoaded(){
    try{
        emptyFunction();
    }catch(ex){
        location.reload();
    }   
}

function setLabels() {
    let engineUnit = sessionStorage.getItem("engineUnit");
    let engineTypeText = $("#engineTypeSelect option:selected").text();
    $("#lblTotalCons").text("Total Consumption (" + engineUnit + ")");
    $("#lblEstCons").text("Estimate Consumption (" + engineUnit + "/hr)");
    let chartTitle = engineTypeText + " Daily Consumption (" + engineUnit + ")";
    if(engineTypeText.includes("Bunker")){
        chartTitle = engineTypeText + " Daily Flow (" + engineUnit + ")";
    }
    $("#chartTitle").text(chartTitle);
    $("#lblTotalAvgDist").text("Today Total Distance (Nm) / Avg. Distance (" + engineUnit + "/Nm)");
}

async function getUserRelatedFleets() {
    let isFirstItem = true;
    let htmlString = "";
    let fleetObjArray = JSON.parse(sessionStorage.getItem("fleetObj"));
    for (let i = 0; i < fleetObjArray.length; i++) {
        let resultObj = fleetObjArray[i];
        let key = resultObj.fleetId;
        let value = resultObj.fleetName;

        if (isFirstItem) {
            htmlString += "<option value='" + key + "' selected>" + value + "</option>";
            FLEETID = key;
            isFirstItem = false;
        } else {
            htmlString += "<option value='" + key + "'>" + value + "</option>";
        }
    }
    $("#fleetSelect").html(htmlString);
}

async function getUserRelatedVessels() {
    let isFirstItem = true;
    let htmlString = "";
    let fleetVesselObjArray = JSON.parse(sessionStorage.getItem("fleetVesselObj"))
    for (let i = 0; i < fleetVesselObjArray.length; i++) {
        let resultObj = fleetVesselObjArray[i];
        if (resultObj.fleetId === FLEETID) {
            let vesselSplitString = resultObj.vesselList.split(";");
            
            for (let j = 0; j < vesselSplitString.length; j++) {
                let key = vesselSplitString[j].split("-")[0];
                let value = vesselSplitString[j].split("-")[1];
                if (isFirstItem) {
                    htmlString += "<option value='" + key + "' selected>" + value + "</option>";
                    VESSELID = key;
                    isFirstItem = false;
                } else {
                    htmlString += "<option value='" + key + "'>" + value + "</option>";
                }
            }
            $("#vesselSelect").html(htmlString);
            try{
                setConstArrays();
            }catch(ex){
                location.reload();
            }
            
            break;
            
        }
    }
}

async function getRecentEventList() {
    var method = "GetRecentEventList";
    try {
        let data = await ajaxGet(method, PARAMETER_COMBINED);
        populateEventList(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateEventList(data) {
    var htmlString = "";
    for (var i = 0; i < data.length; i++) {
        var result = data[i];
        var datetime = result.Datetime;
        var eventType = result.EventType;
        var eventDesc = result.EventDesc;
        var cssClass = "";

        if (eventType === "Alarm") {
            cssClass = "red";
        }
        htmlString += "<div>";
        htmlString += "<p class='" + cssClass + "'>" + datetime + "</p><p class='" + cssClass + "'>" + "[" + eventType + "]" + "</p><p class='" + cssClass + "'>" + eventDesc + "</p>";
        htmlString += "</div>";
    }
    $("#eventLog").html(htmlString);
}

async function getRecentDistance() {
    var method = "GetVesselLatestDistance";
    try {
        let data = await ajaxGet(method, PARAMETER_COMBINED);
        populateRecentDistance(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateRecentDistance(data) {
    var totalDist = numberWithCommas(roundWithZero(parseFloat(data.TotalDistance), 2));
    var avgLitrePerNm = numberWithCommas(roundWithZero(parseFloat(data.AvgLitrePerNm), 2));
    var totalAndAvgLitrePerNm = totalDist + " / " + avgLitrePerNm;
    $("#totalAndAvgLitrePerNm").html(totalAndAvgLitrePerNm);
}

async function getRecentPosition() {
    var method = "GetVesselLatestPosition";
    let parameters = PARAMETER_COMBINED;
    try {
        let data = await ajaxGet(method, parameters);
        populateRecentPosition(data);

        // If the currently selected position query is for live
        // if (SELECTED_POSITION_QUERY === "0") {
        //     updateMapMarker(data.Latitude, data.Longitude, true);
        // }

        $("#lblLastUpdated").text("Position Last Updated : " + data.PositionDatetime);
    } catch (ex) {
        console.log(ex);
    }
}

function populateRecentPosition(data) {
    var wgs84Lat = data.Wgs84Lat;
    var wgs84Lon = data.Wgs84Lon;
    var latAndLon = wgs84Lat + " " + wgs84Lon;
    $("#latAndLon").text(latAndLon);

    var sog = roundWithZero(parseFloat(data.Sog), 1);
    var cog = roundWithZero(parseFloat(data.Cog), 1);
    var sogAndCog = sog + " Knots " + cog + " Deg";
    $("#sogAndCog").html(sogAndCog);
}

async function getLastOperationMode() {
    var method = "GetLastOperationMode";
    try {
        let data = await ajaxGet(method, PARAMETER_COMBINED);
        populateLastOperationMode(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateLastOperationMode(data) {
    var datetime = data.Key;
    var desc = data.Result;
    var htmlString = "OP Mode : ";
    htmlString += "<p class='blue'>" + desc + "</p>";
    htmlString += " " + datetime;
    $("#lastOperationMode").html(htmlString);
}

async function getEngineTotalAndEstConsumption() {
    var method = "GetEngineTotalAndEstConsumption";
    let parameters = PARAMETER_COMBINED;
    parameters.engineType = SELECTED_ENGINE_TYPE;

    try {
        let data = await ajaxGet(method, parameters);
        populateEngineTotalAndEstConsumption(data);
    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function populateEngineTotalAndEstConsumption(data) {
    var totalCons = numberWithCommas(roundWithZero(parseFloat(data.TotalCons), 2));
    var estCons = numberWithCommas(roundWithZero(parseFloat(data.EstCons), 2));
    var userStartDatetime = data.UserStartDatetime;
    $("#totalCons").html(totalCons);
    $("#estCons").html(estCons);
    $("#userStartDatetime").html(userStartDatetime);
    let engineTypeText = $("#engineTypeSelect option:selected").text();
    $(".engine-type-header").html(engineTypeText);
}

async function getAllEngineTypes() {
    method = "GetAllEngineTypesWithoutBunker";
    try {
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateAllEngineTypesToSelect(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateAllEngineTypesToSelect(data) {
    var htmlString = "";
    for (var i = 0; i < data.length; i++) {
        var result = data[i];
        if (i === 0) {
            htmlString += "<option value='" + result.Key + "' selected>" + result.Result + "</option>";
            SELECTED_ENGINE_TYPE = result.Key;
        } else {
            htmlString += "<option value='" + result.Key + "'>" + result.Result + "</option>";
        }
    }

    $("#engineTypeSelect").html(htmlString);
}

async function createEngineChartByEngineType() {
    var method = "GetDailyEngineChartByEngineType";
    let parameters = PARAMETER_COMBINED;
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        let yAxisUnit = "";
        $.each(data , function(key ,value){
            yAxisUnit = value[0].Unit;
        });
        createChart(yAxisUnit);
        addSeriesIntoChart(data);
    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function createChart(yAxisUnit) {
    options = {
        chart: {
            type: "line",
            style: {
                'fontFamily': 'Tahoma'
            }
        },
        title: {
            text: ""
        },
        xAxis: {
            type: "datetime"
        },
        yAxis: {
            title: {
                text : yAxisUnit
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        tooltip: {
            formatter: function () {
                var formatter = tooltipFormatter(this);
                return formatter;
            }
        }
    };

    $("#chart").highcharts($.extend(true, {}, options));
}

async function loadLiveChartPoint(chart) {
    var maxLiveNumber = 30;
    var timeOfLastPoint = getTimeofLastPoint(chart.series[0].data);
    var method = "GetEngineLiveChartPoint";
    let parameters = PARAMETER_COMBINED;
    parameters.timeOfLastPoint = timeOfLastPoint;
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        addLiveChartPointToChart(data, chart);
    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function addLiveChartPointToChart(data, chart) {
    var seriesCount = 0;
    var maxLiveNumber = 30;
    $.each(data, function (indexInArray, valueOfElement) {
        var seriesArray = [];
        var seriesName = indexInArray;
        var singleObject = valueOfElement;
        for (var i = 0; i < singleObject.length; i++) {
            var result = singleObject[i];
            var value = round(parseFloat(result.CALCULATED_TOTAL_FLOW), 2);
            var ticks = parseFloat(result.Ticks);
            var additionalInfo = result.ADDITIONAL_INFO;
            var unit = result.Unit;

            if (chart.series[seriesCount].data.length < maxLiveNumber) {
                chart.series[seriesCount].addPoint({
                    x: ticks,
                    y: value,
                    additionalInfo: additionalInfo,
                    unit: unit
                });
            } else {
                chart.series[seriesCount].addPoint({
                    x: ticks,
                    y: value,
                    additionalInfo: additionalInfo,
                    unit: unit
                }, true, true);
            }

        }
        seriesCount++;
    });
}

function getTimeofLastPoint(seriesArray) {
    let length = seriesArray.length;
    let time = seriesArray[length - 1].x;
    return time;
}

function tooltipFormatter(chart) {
    let dateFormatHC = '%d-%b-%y %H:%M:%S';
    let rateText = "";
    let chartTitle = $("#chartTitle").text();
    let startDatetime = chart.x - (86400 * 1000); // value - 1 day 
    let endDatetime = chart.x - (1 * 1000); // value - 1 second
    let engineUnit = sessionStorage.getItem("engineUnit");

    if (!chartTitle.includes("Bunker")) {
        rateText = "Consumption : ";
    } else {
        rateText = "Flow : "; // Bunker
    }

    let formatter = "<b>" + chart.series.name + "</b><br>" +
        Highcharts.dateFormat(dateFormatHC, startDatetime) + " - " + Highcharts.dateFormat(dateFormatHC, endDatetime) + "<br>" +
        rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit;

    if (!chartTitle.includes("Bunker")) {
        formatter += "<br>" + chart.point.additionalInfo;
    }

    return formatter;
}

function addSeriesIntoChart(data) {
    $.each(data, function (indexInArray, valueOfElement) {
        var seriesArray = [];
        var seriesName = indexInArray;
        var singleObject = valueOfElement;
        for (var i = 0; i < singleObject.length; i++) {
            var result = singleObject[i];
            var value = round(parseFloat(result.CALCULATED_TOTAL_FLOW), 2);
            var ticks = parseFloat(result.Ticks);
            var additionalInfo = result.ADDITIONAL_INFO;
            var unit = result.Unit;

            seriesArray.push({ x: ticks, y: value, additionalInfo: additionalInfo, unit: unit });
        }
        addSingleSeriesIntoChart(seriesArray, seriesName, "spline");
    });
}

function addSingleSeriesIntoChart(seriesArray, seriesName, chartType) {
    $("#chart").highcharts().addSeries({
        type: chartType,
        name: seriesName,
        data: seriesArray
    });
}

async function generateStaticMapFromQueryTime() {
    var method = "GenerateMapFromQueryTime";
    //resetConstArrays();
    let parameters = PARAMETER_COMBINED;
    parameters.queryTime = SELECTED_POSITION_QUERY;
    try {
        await initMap("map");
        let data = await ajaxGet(method, parameters);
        insertMapMarkersWithEvents(data, MAP);
        addPolylinesToMap(data);
        // await addPolylinesToMap(data);
        // MAP.fitBounds(FEATURE_GROUP.getBounds());

    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function addPolylinesToMap(data) {
    var latLonArray = [];
    featureGroup = [];
    for (var i = 0; i < data.length; i++) {
        var resultArray = data[i];
        var currentArray = [parseFloat(resultArray.Latitude), parseFloat(resultArray.Longitude)];
        latLonArray.push(currentArray);
    }
    drawPolylineOnMap(latLonArray, MAP, true);
    setStartEndMarkerOnPopupMap(data, MAP);
}

// Get the latest position to generate a live map
// Subsequent position will be retrieved from getVessellatestPosition method
async function generateLiveMap() {
    var method = "GetVesselLatestPosition";
    try {
        await initMap("map");
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        updateMapMarker(data.Latitude, data.Longitude, true);
    } catch (ex) {
        console.log(ex);
    }
}

function selectDropdownChangeEvent() {
    $("#fleetSelect").change(function () {
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#queryTime").change(function () {
        SELECTED_POSITION_QUERY = $("#queryTime").val();
        switch (SELECTED_POSITION_QUERY) {
            case "0":
                // Live 
                generateLiveMap();
                break;

            default:
                generateStaticMapFromQueryTime();
                break;
        }
    });

    $("#engineTypeSelect").change(function () {
        selectDropdownFunction();
    });

    $("#vesselSelect").change(function () {
        VESSELID = $("#vesselSelect").val();
        resetConstArrays();
    });
}

async function selectDropdownFunction(){
    showLeftLoader();
    SELECTED_ENGINE_TYPE = $("#engineTypeSelect").val();
    var htmlString = "";
    switch (SELECTED_ENGINE_TYPE) {
        case "4":
            htmlString = "Daily Flow Rate";
            break;

        default:
            htmlString = "Daily Fuel Consumption";
            break;
    }
    $("#chartTitle").html(htmlString);
    await createEngineChartByEngineType();
    getEngineTotalAndEstConsumption();
    setLabels();
    hideLeftLoader();
}

function submitBtnClickHandler() {
    $("#submitBtn").click(function () {
       submitFunction(); 
    });
}

async function submitFunction(){
    showMainLoader();
    await getAllEngineTypes();
    getLastOperationMode();
    getRecentEventList();
    getRecentDistance();
    getRecentPosition();
    getEngineTotalAndEstConsumption();
    generateStaticMapFromQueryTime();
    await createEngineChartByEngineType();
    hideMainLoader();
}