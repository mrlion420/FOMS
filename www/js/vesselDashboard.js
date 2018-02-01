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
    await getUserRelatedVessels();
    await getAllEngineTypes();
    await initMap("map");
    selectDropdownChangeEvent();
    submitBtnClickHandler();
    getLastOperationMode(); 
    createEngineChartByEngineType();
    generateStaticMapFromQueryTime();
    
    getRecentEventList();
    // setInterval(getRecentEventList, 1000 * 10);

    getRecentDistance();
    // setInterval(getRecentDistance, 1000 * 3);

    getRecentPosition();
    // setInterval(getRecentPosition, 1000 * 3);

    getEngineTotalAndEstConsumption();
    // setInterval(getEngineTotalAndEstConsumption, 1000 * 3);

}

async function getUserRelatedCompany(){
    var method = "GetUserRelatedCompany";
    try{
        //let data = await ajaxGet(method, PARAMETER_USERID);
        //populateCompanySelectBox(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateCompanySelectBox(data){
    var htmlString = "";
    var isFirstItem = true;

    $.each(data, function(index,valueInElement){
        var key = data[index].Key;
        var value = data[index].Result;
        if(isFirstItem){
            htmlString += "<option value='" + key + "' selected>" + value +"</option>";    
            COMPANYID = key;
            isFirstItem = false;
        }else{
            htmlString += "<option value='" + key + "'>" + value +"</option>";
        }
        
    });
    $("#companySelect").html(htmlString);
}

async function getUserRelatedFleetsAndVessels(){
    var method = "GetUserRelatedFleetsAndVessels";
    try{
        let data = await ajaxGet(method , PARAMETER_USERID);
        populateFleetAndVesselSelectBox(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateFleetAndVesselSelectBox(data){
    var fleetArray = data[0];
    var vesselArray = data[1];
    var isFirstItem = true;
    var htmlString = "";

    $.each(fleetArray, function(index,valueInElement){
        var key = fleetArray[index].Key;
        var value = fleetArray[index].Result;

        if(isFirstItem){
            htmlString += "<option value='" + key + "' selected>" + value +"</option>";
            FLEETID = key;
            isFirstItem = false;
        }else{
            htmlString += "<option value='" + key + "'>" + value +"</option>";
        }
        
    });
    $("#fleetSelect").html(htmlString);
    isFirstItem = true; // Reset the bool

    $.each(vesselArray, function(index,valueInElement){
        var key = vesselArray[index].Key;
        var value = vesselArray[index].Result;

        if(isFirstItem){
            htmlString += "<option value='" + key + "' selected>" + value +"</option>";
            VESSELID = key;
            isFirstItem = false;
        }else{
            htmlString += "<option value='" + key + "'>" + value +"</option>";
        }
        
    });
    $("#vesselSelect").html(htmlString);
}

async function getUserRelatedFleets(){
    var method = "GetUserRelatedFleets";
    try{
        let data = await ajaxGet(method, PARAMETER_USERID);
        populateFleetSelectBox(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateFleetSelectBox(data){
    var isFirstItem = true;
    var htmlString = "";
    $.each(data, function(index,valueInElement){
        var key = data[index].Key;
        var value = data[index].Result;
        if(isFirstItem){
            htmlString += "<option value='" + key + "' selected>" + value +"</option>";    
            FLEETID = key;
            isFirstItem = false;
        }else{
            htmlString += "<option value='" + key + "'>" + value +"</option>";
        }
        
    });
    $("#fleetSelect").html(htmlString);
}

async function getUserRelatedVessels(){
    var method = "GetUserRelatedVessels";
    let parameters = PARAMETER_USERID;
    parameters.fleetId = FLEETID;
    try{
        let data = await ajaxGet(method, parameters);
        populateVesselSelectBox(data);
    }catch(ex){
        console.log(ex);
    }
    resetConstArrays();
}

function populateVesselSelectBox(data){
    var isFirstItem = true;
    var htmlString = "";

    $.each(data, function(index,valueInElement){
        var key = data[index].Key;
        var value = data[index].Result;
        if(isFirstItem){
            htmlString += "<option value='" + key + "' selected>" + value +"</option>";    
            if(PAGELOAD){
                VESSELID = key;
                PAGELOAD = false;
            }else{
                TEMP_VESSELID = key;
            }
            isFirstItem = false;
        }else{
            htmlString += "<option value='" + key + "'>" + value +"</option>";
        }
        
    });
    $("#vesselSelect").html(htmlString);
}

async function getRecentEventList() {
    var method = "GetRecentEventList";
    try {
        let data = await ajaxGet(method , PARAMETER_COMBINED);
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

async function getRecentPosition(){
    var method = "GetVesselLatestPosition";
    try{
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateRecentPosition(data);

        // If the currently selected position query is for live
        if(SELECTED_POSITION_QUERY === "0"){
            updateMapMarker(data.Latitude, data.Longitude , true);
        }
    }catch(ex){
        console.log(ex);
    }
}

function populateRecentPosition(data){
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
    let parameters = PARAMETER_VESSELID;
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        populateEngineTotalAndEstConsumption(data);
    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function populateEngineTotalAndEstConsumption(data){
    var totalCons = numberWithCommas(roundWithZero(parseFloat(data.TotalCons), 2));
    var estCons = numberWithCommas(roundWithZero(parseFloat(data.EstCons), 2));
    var userStartDatetime = data.UserStartDatetime;
    $("#totalCons").html(totalCons);
    $("#estCons").html(estCons);
    $("#userStartDatetime").html(userStartDatetime);
}

async function getAllEngineTypes(){
    method = "GetAllEngineTypes";
    try{
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateAllEngineTypesToSelect(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateAllEngineTypesToSelect(data){
    var htmlString = "";
    for(var i = 0; i < data.length; i++){
        var result = data[i];
        if(i === 0){
            htmlString += "<option value='" + result.Key + "' selected>" + result.Result + "</option>";
            SELECTED_ENGINE_TYPE = result.Key;
        }else{
            htmlString += "<option value='" + result.Key + "'>" + result.Result + "</option>";
        }
    }
    
    $("#engineTypeSelect").html(htmlString);
}

async function createEngineChartByEngineType(){
    var method = "GetDailyEngineChartByEngineType";
    let parameters = PARAMETER_COMBINED;
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try{
        let data = await ajaxGet(method, parameters);
        createChart();
        addSeriesIntoChart(data);
    }catch(ex){
        console.log(ex);
    }
    //resetConstArrays();
}

function createChart(){
    options = {
        chart: {
            type: "line",
            style: {
                'fontFamily': 'Tahoma'
            }
        },
        title: {
            text : ""
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

async function loadLiveChartPoint(chart){
    var maxLiveNumber = 30;
    var timeOfLastPoint = getTimeofLastPoint(chart.series[0].data);
    var method = "GetEngineLiveChartPoint";
    let parameters = PARAMETER_COMBINED;
    parameters.timeOfLastPoint = timeOfLastPoint;
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try{
        let data = await ajaxGet(method, parameters);
        addLiveChartPointToChart(data, chart);
    }catch(ex){
        console.log(ex);
    }
    //resetConstArrays();
}

function addLiveChartPointToChart(data , chart){
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

            if(chart.series[seriesCount].data.length < maxLiveNumber){
                chart.series[seriesCount].addPoint({
                    x : ticks,
                    y : value,
                    additionalInfo : additionalInfo,
                    unit : unit
                });
            }else{
                  chart.series[seriesCount].addPoint({
                    x : ticks,
                    y : value,
                    additionalInfo : additionalInfo,
                    unit : unit
                }, true,true);
            }
            
        }
        seriesCount++;
    });
}

function getTimeofLastPoint(seriesArray){
    var length = seriesArray.length;
    var time = seriesArray[length - 1].x;
    return time;
}

function tooltipFormatter(chart){
    var dateFormatHC = '%d-%b-%y %H:%M:%S';
    var rateText = "";
    var formatter = "";
    var chartTitle = $("#chartTitle").text();

    if (chartTitle !== "Daily Flow Rate") {
        rateText = "Consumption : "; 
    } else {
        rateText = "Flow Rate : "; // Bunker
    }

    formatter = "<b>" + chart.series.name + "</b><br>" +
        Highcharts.dateFormat(dateFormatHC, chart.x) + "<br>" +
        rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit;

    if (chartTitle === "Fuel Cons. Rate (ℓ/hr)") {
        formatter += "<br>" + chart.point.additionalInfo;
    }

    return formatter;
}

function addSeriesIntoChart(data){
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

function addSingleSeriesIntoChart(seriesArray, seriesName, chartType){
    $("#chart").highcharts().addSeries({
        type : chartType,
        name: seriesName,
        data: seriesArray
    });
}

async function generateStaticMapFromQueryTime(){
    var method = "GenerateMapFromQueryTime";
    //resetConstArrays();
    let parameters = PARAMETER_VESSELID;
    parameters.queryTime = SELECTED_POSITION_QUERY;
    try{
        await initMap("map");
        let data = await ajaxGet(method, parameters);
        await addPolylinesToMap(data);
        // MAP.fitBounds(FEATURE_GROUP.getBounds());

    }catch(ex){
        console.log(ex);
    }
    //resetConstArrays();
}

function addPolylinesToMap(data){
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
async function generateLiveMap(){
    var method = "GetVesselLatestPosition";
    try{
        await initMap("map");
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        updateMapMarker(data.Latitude, data.Longitude , true);        
    }catch(ex){
        console.log(ex);
    }
}

function selectDropdownChangeEvent(){
    $("#fleetSelect").change(function(){
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#queryTime").change(function(){
        SELECTED_POSITION_QUERY = $("#queryTime").val();
        switch(SELECTED_POSITION_QUERY){
            case "0":
            // Live 
            generateLiveMap();
            break;

            default:
            generateStaticMapFromQueryTime();
            break;
        }
    });

    $("#engineTypeSelect").change(function(){
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
        createEngineChartByEngineType();
        getEngineTotalAndEstConsumption();
    });

    $("#vesselSelect").change(function(){
        TEMP_VESSELID = $("#vesselSelect").val();
    });
}

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
        VESSELID = TEMP_VESSELID;
        resetConstArrays();

        getLastOperationMode(); 
        createEngineChartByEngineType();
        getRecentEventList();
        getRecentDistance();
        getRecentPosition();
        getEngineTotalAndEstConsumption();
        generateStaticMapFromQueryTime();
    });
}