$(document).ready(function () {
    mainFunction();
});

// Page Global
var SELECTED_ENGINE_TYPE = null;
var SELECTED_POSITION_QUERY = "24";
var CHART_INTERVAL = null;
var MAP_INTERVAL = null;

async function mainFunction() {
    
    await getUserRelatedFleets();
    await getAllEngineTypesByFleet();

    setLabels();
    getEngineTotalAndEstConsumptionByFleet();
    getBunkeringByFleet();
    createEngineChartByFleet();
    getLatestEventListByFleet();
    GetDistanceAndAvgConsAndReportingVessels();
    GetFleetCurrentPosition();

    // Handlers
    submitBtnClickHandler();
    selectDropdownChangeEvent();
}

function setLabels() {
    let engineUnit = sessionStorage.getItem("engineUnit");
    let engineTypeText = $("#engineTypeSelect option:selected").text();
    $("#lblTotalCons").text("Total Consumption (" + engineUnit + ")");
    $("#lblEstCons").text("Estimate Consumption (" + engineUnit + "/hr)");
    $("#chartTitle").text(engineTypeText + " Daily Fuel Cons. Rate (" + engineUnit + "/hr)");
    $("#lblBunkerIn").text("Total Bunkering In (" + engineUnit + ")");
    $("#lblBunkerOut").text("Total Bunkering Out (" + engineUnit + ")");
    $("#avgConsPerDist").text("Avg. Cons (" + engineUnit + "/Nm)");
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
    try{
        setConstArrays();
    }catch(ex){
        location.reload();
    }
    
}

async function getAllEngineTypesByFleet() {
    method = "GetAllEngineTypesByFleet";
    var parameters = { fleetId: FLEETID };
    try {
        let data = await ajaxGet(method, parameters);
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

async function getEngineTotalAndEstConsumptionByFleet() {
    var method = "GetEngineTotalAndEstConsumptionByFleet";
    var parameters = { fleetId: FLEETID, timezone: TIMEZONE };
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        populateEngineTotalAndEstConsumption(data);
    } catch (ex) {
        console.log(ex);
    }
    resetConstArrays();
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

async function createEngineChartByFleet() {
    var method = "GetTotalEngineChartByFleet";
    var parameters = { fleetId: FLEETID, timezone: TIMEZONE };
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        createChart();
        addSeriesIntoChart(data);
    } catch (ex) {
        console.log(ex);
    }
    resetConstArrays();
}

function createChart() {
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

function tooltipFormatter(chart) {
    let dateFormatHC = '%d-%b-%y %H:%M:%S';
    let rateText = "";
    let chartTitle = $("#chartTitle").text();
    let startDatetime = chart.x - (86400 * 1000); // value - 1 day 
    let endDatetime = chart.x - (1 * 1000); // value - 1 second
    let engineUnit = sessionStorage.getItem("engineUnit");

    if (chartTitle !== "Daily Fuel Cons. Rate (" + engineUnit + "/hr)") {
        rateText = "Est. Flow Rate : "; // Bunker
    } else {
        rateText = "Est. Consumption Rate (" + engineUnit + "/hr) : ";
    }

    let formatter = "<b>" + chart.series.name + "</b><br>" +
        Highcharts.dateFormat(dateFormatHC, startDatetime) + " - " + Highcharts.dateFormat(dateFormatHC, endDatetime) + "<br>" +
        rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit;

    if (chartTitle === "Fuel Cons. Rate (ℓ/hr)") {
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
            var value = round(parseFloat(result.EST_FLOW_RATE), 2);
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

async function getBunkeringByFleet() {
    var method = "GetBunkeringByFleet";
    var parameters = { fleetId: FLEETID };
    try {
        let data = await ajaxGet(method, parameters);
        populateBunkering(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateBunkering(data) {
    var bunkerIn = numberWithCommas(round(parseFloat(data.BunkerIn), 2));
    var bunkerOut = numberWithCommas(round(parseFloat(data.BunkerOut), 2));
    $("#totalBunkerIn").html(bunkerIn);
    $("#totalBunkerOut").html(bunkerOut);
}

function selectDropdownChangeEvent() {
    $("#fleetSelect").change(function () {
        FLEETID = $("#fleetSelect").val();
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
        let engineUnit = sessionStorage.getItem("engineUnit");
        SELECTED_ENGINE_TYPE = $("#engineTypeSelect").val();
        let engineTypeText = $("#engineTypeSelect option:selected").text();
        var htmlString = "";
        switch (SELECTED_ENGINE_TYPE) {
            case "4":
                htmlString = engineTypeText + " Daily Est. Flow Rate (" + engineUnit + "/hr) " ;
                break;

            default:
                htmlString = engineTypeText + " Daily Fuel Cons. Rate (" + engineUnit + "/hr) ";
                break;
        }
        $("#chartTitle").html(htmlString);
        createEngineChartByFleet();
        getEngineTotalAndEstConsumptionByFleet();
    });
}

async function getLatestEventListByFleet() {
    var method = "GetLatestEventListByFleet";
    var parameters = { fleetId: FLEETID, timezone: TIMEZONE };
    try {
        let data = await ajaxGet(method, parameters);
        populateEventListByFleet(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateEventListByFleet(data) {
    var htmlString = "";
    for (var i = 0; i < data.length; i++) {
        var result = data[i];
        var datetime = result.Datetime;
        var eventType = result.EventType;
        var eventDesc = result.EventDesc;
        var vesselName = result.VesselName;
        var cssClass = "";

        if (eventType === "Alarm") {
            cssClass = "red";
        }
        htmlString += "<div>";
        htmlString += "<p class='" + cssClass + "'>" + datetime + "</p><p class='" + cssClass + "'>" + vesselName + "</p><p class='" + cssClass + "'>" + "[" + eventType + "]" + "</p><p class='" + cssClass + "'>" + eventDesc + "</p>";
        htmlString += "</div>";
    }
    $("#eventLog").html(htmlString);
}

async function GetDistanceAndAvgConsAndReportingVessels() {
    var method = "GetDistanceAndAvgConsAndReportingVessels";
    var parameters = { fleetId: FLEETID, timezone: TIMEZONE };
    try {
        let data = await ajaxGet(method, parameters);
        populateDistanceAndAvgConsAndReportingVessels(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateDistanceAndAvgConsAndReportingVessels(data) {
    for (var i = 0; i < data.length; i++) {
        var result = data[i];
        $("#" + result.Key).html(numberWithCommas(round(parseFloat(result.Result), 2)));
    }
}

async function GetFleetCurrentPosition() {
    var method = "GetFleetCurrentPosition";
    var parameters = { fleetId: FLEETID };
    try {
        let data = await ajaxGet(method, parameters);
        await initMap("map");
        populateFleetCurrentPositionOnMap(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateFleetCurrentPositionOnMap(data) {
    insertMapMarkers(data, MAP);
}

function submitBtnClickHandler() {
    $("#submitBtn").click(function () {
        buttonClickFunctions();
    });
}

async function buttonClickFunctions() {
    await getAllEngineTypesByFleet();
    setLabels();
    createEngineChartByFleet();
    getEngineTotalAndEstConsumptionByFleet();
    getBunkeringByFleet();
    getLatestEventListByFleet();
    GetDistanceAndAvgConsAndReportingVessels();
    GetFleetCurrentPosition();
}