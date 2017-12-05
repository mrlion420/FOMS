$(document).ready(function () {
    mainFunction();
});

// Page Global
var SELECTED_ENGINE_TYPE = null;
var SELECTED_POSITION_QUERY = "24";
var CHART_INTERVAL = null;
var MAP_INTERVAL = null;

async function mainFunction(){
    await getUserRelatedFleets();
    await getAllEngineTypesByFleet();
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

async function getAllEngineTypesByFleet(){
    method = "GetAllEngineTypesByFleet";
    var parameters = { fleetId: FLEETID };
    try{
        let data = await ajaxGet(method, parameters);
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

async function getEngineTotalAndEstConsumptionByFleet() {
    var method = "GetEngineTotalAndEstConsumptionByFleet";
    var parameters = { fleetId : FLEETID , timezone : TIMEZONE };
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try {
        let data = await ajaxGet(method, parameters);
        populateEngineTotalAndEstConsumption(data);
    } catch (ex) {
        console.log(ex);
    }
    resetConstArrays();
}

function populateEngineTotalAndEstConsumption(data){
    var totalCons = numberWithCommas(roundWithZero(parseFloat(data.TotalCons), 2));
    var estCons = numberWithCommas(roundWithZero(parseFloat(data.EstCons), 2));
    var userStartDatetime = data.UserStartDatetime;
    $("#totalCons").html(totalCons);
    $("#estCons").html(estCons);
    $("#userStartDatetime").html(userStartDatetime);
}

async function createEngineChartByFleet(){
    var method = "GetTotalEngineChartByFleet";
    var parameters = { fleetId: FLEETID , timezone : TIMEZONE };
    parameters.engineType = SELECTED_ENGINE_TYPE;
    try{
        let data = await ajaxGet(method, parameters);
        createChart();
        addSeriesIntoChart(data);
    }catch(ex){
        console.log(ex);
    }
    resetConstArrays();
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

function tooltipFormatter(chart){
    var dateFormatHC = '%d-%b-%y %H:%M:%S';
    var rateText = "";
    var formatter = "";
    var chartTitle = $("#chartTitle").text();

    if (chartTitle !== "Fuel Cons. Rate (ℓ/hr)") {
        rateText = "Est. Flow Rate : "; // Bunker
    } else {
        rateText = "Est. Consumption Rate (ℓ/hr) : ";
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

async function getBunkeringByFleet(){
    var method = "GetBunkeringByFleet";
    var parameters = { fleetId : FLEETID };
    try{
        let data = await ajaxGet(method, parameters);
        populateBunkering(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateBunkering(data){
    var bunkerIn = numberWithCommas(round(parseFloat(data.BunkerIn), 2));
    var bunkerOut = numberWithCommas(round(parseFloat(data.BunkerOut), 2));
    $("#totalBunkerIn").html(bunkerIn);
    $("#totalBunkerOut").html(bunkerOut);
}

function selectDropdownChangeEvent(){
    $("#fleetSelect").change(function(){
        FLEETID = $("#fleetSelect").val();
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
                htmlString = "Est. Consumption Rate (ℓ/hr)";
                break;

            default:
                htmlString = "Fuel Cons. Rate (ℓ/hr)";
                break;
        }
        $("#chartTitle").html(htmlString);
        createEngineChartByFleet();
        // getEngineTotalAndEstConsumption();
    });
}

async function getLatestEventListByFleet(){
    var method = "GetLatestEventListByFleet";
    var parameters = { fleetId : FLEETID, timezone : TIMEZONE };
    try{
        let data = await ajaxGet(method, parameters);
        populateEventListByFleet(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateEventListByFleet(data){
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

async function GetDistanceAndAvgConsAndReportingVessels(){
    var method = "GetDistanceAndAvgConsAndReportingVessels";
    var parameters = { fleetId: FLEETID, timezone: TIMEZONE };
    try{
        let data = await ajaxGet(method, parameters);
        populateDistanceAndAvgConsAndReportingVessels(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateDistanceAndAvgConsAndReportingVessels(data){
    for(var i = 0; i < data.length; i++){
        var result = data[i];
        $("#" + result.Key).html(numberWithCommas(round(parseFloat(result.Result),2)));
    }
}

async function GetFleetCurrentPosition(){
    var method = "GetFleetCurrentPosition";
    var parameters = { fleetId : FLEETID };
    try{
        let data = await ajaxGet(method, parameters);
        await initMap("map");
        populateFleetCurrentPositionOnMap(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateFleetCurrentPositionOnMap(data){
    insertMapMarkers(data, MAP);
}

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
        buttonClickFunctions();
    });
}

async function buttonClickFunctions(){
    await getAllEngineTypesByFleet();
    createEngineChartByFleet();
    getEngineTotalAndEstConsumptionByFleet();
    getBunkeringByFleet();
    getLatestEventListByFleet();
    GetDistanceAndAvgConsAndReportingVessels();
    GetFleetCurrentPosition();
}