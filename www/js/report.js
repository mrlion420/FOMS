$(document).ready(function () {
    mainFunction();

});

let maxTableRows = 12;
let globalPositionData = null;
let globalStartDatetime = null;
let globalEndDatetime = null;
let reportId = null;
let intervalValue = null;

async function mainFunction() {
    await getUserRelatedFleets();
    await getUserRelatedVessels();

    loadSelectMainContainer();
    selectChangeEventHandler();
    buttonClickHandler();
    dynamicTablePaginationClickHandler(maxTableRows, "resultContainer");
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
                refreshPage();
            }
            
            break;
            
        }
    }
}

function loadSelectMainContainer() {
    removeDatetimePickers();

    var reportType = $("#selectReportType").val();
    $("#selectMainContainer").html("");
    $("#selectMainContainer").load("../report_items/" + reportType + ".html", function () {
        loadDatetimePickers();
        loadMainSelectType();
    });
}

function selectChangeEventHandler() {
    $("#fleetSelect").change(function () {
        FLEETID = $("#fleetSelect").val();
        fleetChangeFunction();
    });

    $("#vesselSelect").change(function () {
        VESSELID = $("#vesselSelect").val();
        resetConstArrays();
        loadMainSelectType();
    });

    $("#selectReportType").change(function () {
        loadSelectMainContainer();
    });

    $("#selectMainContainer").on("change", "#selectInterval", function () {
        changeDatetimeFormat();
    });

}

async function fleetChangeFunction() {
    await getUserRelatedVessels();
    loadMainSelectType();
}

async function loadDatetimePickers() {
    let method = "GetCurrentDatetime_ForDateTimePicker";
    let parameters = PARAMETER_USERID;
    parameters.timezone = TIMEZONE;
    try {
        let data = await ajaxGet(method, parameters);
        insertDatetime(data);

    } catch (ex) {
        console.log(ex);
    }

}

function insertDatetime(data) {

    let startDateString = data.StartDatetime;
    let endDateString = data.EndDatetime;
    globalStartDatetime = startDateString;
    globalEndDatetime = endDateString;
    let format = "d-M-y H:i";

    $("#startDatetime").datetimepicker({
        value: startDateString,
        format: format,
        timepicker: false
    });
    $("#endDatetime").datetimepicker({
        value: endDateString,
        format: format,
        timepicker: false
    });
}

function changeDatetimeFormat() {
    let interval = $("#selectInterval").val();
    let format = "d-M-y H:i";
    let step = "";
    let timepicker = true;
    // Interval is in hours
    switch (interval) {
        case "0.25":
            step = 15;
            break;

        case "0.5":
            step = 30;
            break;

        case "1":
            step = 60;
            break;

        default:
            timepicker = false;
            break;
    }
    if (timepicker) {
        $("#startDatetime").datetimepicker({
            timepicker: timepicker,
            format: format,
            step: step
        });
        $("#endDatetime").datetimepicker({
            timepicker: timepicker,
            format: format,
            step: step
        });
    } else {
        $("#startDatetime").datetimepicker({
            value: globalStartDatetime,
            format: format,
            timepicker: false
        });
        $("#endDatetime").datetimepicker({
            value: globalEndDatetime,
            format: format,
            timepicker: false
        });
    }

}

async function loadMainSelectType() {
    let data, method;
    var reportType = $("#selectReportType").val();
    switch (reportType) {
        case "FuelCons_Report":
            method = "GetAllEngineTypes";
            break;

        case "Loading_Report":
            method = "GetAllEngineTypes";
            break;

        case "Analog_Report":
            method = "GetAllAnalogTypes";
            break;

        case "Event_Report":
            method = "GetAllEventTypes";
            break;

        default:
            method = undefined;
            break;
    }

    if (method !== undefined) {
        data = await ajaxGet(method, PARAMETER_VESSELID);
        $("#selectMainType").html("");
        for (let i = 0; i < data.length; i++) {
            let htmlString = "<option value='" + data[i].Key + "'>" + data[i].Result + "</option>";
            $("#selectMainType").append(htmlString);
        }
    }

}

function removeDatetimePickers() {
    $("#startDatetime").datetimepicker('destroy');
    $("#endDatetime").datetimepicker('destroy');
}

function buttonClickHandler() {
    $("#selectMainContainer").on("click", "#btnChart", function () {
        var reportType = $("#selectReportType").val();
        switch (reportType) {
            case "FuelCons_Report":
                btnChart_FuelCons();
                break;

            case "Loading_Report":
                method = "GetAllEngineTypes";
                break;

            case "Analog_Report":
                btnChart_Analog();
                break;

            case "Event_Report":
                method = "GetAllEventTypes";
                break;

            default:
                method = undefined;
                break;
        }
    });

    $("#selectMainContainer").on("click", "#btnMap", function () {
        btnMap_Position();
    });

    $("#resultContainer").on("click", "tr", function () {
        let firstColumn = $(this).find("td:first").text();
        let id = parseInt(firstColumn);
        let splitString = globalPositionData[id].EventDesc.split("|");
        let eventDetails = "";

        for (let i = 0; i < splitString.length; i++) {
            let lastIndex = getPosition(splitString[i], "~", 3);
            let singleEvent = splitString[i].substring(lastIndex + 1);
            eventDetails += "<label class='event-detail'>" + singleEvent + "</label><br/>";
        }
        customAlert("Events", eventDetails, false, null);
    });

    $("#selectMainContainer").on("click", "#btnExport", function () {
        let reportType = $("#selectReportType").val();
        exportFunction(reportType);
    });
}

async function exportFunction(reportType){
    let method = "GenerateReport";
    let parameters = PARAMETER_COMBINED;
    parameters.userId = sessionStorage.getItem("userId");
    parameters.querytime = $("#selectInterval").val();
    parameters.startDatetimeStr = $("#startDatetime").val();
    parameters.endDatetimeStr = $("#endDatetime").val();
    parameters.reportType = reportType;
    parameters.selectMainType = $("#selectMainType").val();
    try{
        let data = await ajaxGet(method, parameters);
        reportId = data.Result;
        intervalValue = setInterval(function(){
            checkReportStatus();
        }, 1000 * 5);
        
    }catch(ex){
        console.log(ex);
    }
    
}

async function checkReportStatus(){
    let method = "CheckReportStatus";
    let parameters = PARAMETER_VESSELID;
    parameters.reportId = reportId;
    try{
        let data = await ajaxGet(method, parameters);
        if(data.Result === "2"){
            clearInterval(intervalValue);
            let htmlString = "<p>Report has been generated successfully. Please click on Download button to download the report</p>" +
            "<a id='download' href='export_reports/" + reportId + "' download>Download</a><a id='close'>Close</a>";
            $("#reportDownloadDiv").html(htmlString);
            $("#reportDownload").show();
        }
    }catch(ex){
        console.log(ex);
    }
}

async function btnChart_FuelCons() {
    generateChartReportView();

    method = "GetEngineChartByQueryTime";
    let parameters = PARAMETER_COMBINED;
    parameters.querytime = $("#selectInterval").val();
    parameters.startDatetimeStr = $("#startDatetime").val();
    parameters.endDatetimeStr = $("#endDatetime").val();
    parameters.engineType = $("#selectMainType").val();
    try {
        let engineType = $("#selectMainType").val();
        let chartTitle = "";
        let htmlString = "";

        if (engineType === "4") {
            // Bunker
            chartTitle = "Fuel Flow ";
            htmlString = createTableHeaders("Bunker");
        } else {
            chartTitle = "Fuel Consumption (" + $("#selectInterval option:selected").text() + ")";
            htmlString = createTableHeaders("Engine");
        }

        createChart("Engine", chartTitle);
        let data = await ajaxGet(method, parameters);
        let finalTotalCons = 0;
        let finalRunningTime = 0;
        let finalAvgConsRate = 0;

        let chartLineType = $("#selectChartType").val();
        $.each(data, function (key, value) {
            let seriesArray = [];
            let series = value;
            let seriesName = key;
            let totalCons = 0;
            let runningTime = 0;
            let avgConsRate = 0;

            for (let i = 0; i < series.length; i++) {
                let result = series[i];
                let value = round(parseFloat(result.CALCULATED_TOTAL_FLOW), 2);
                let ticks = parseFloat(result.Ticks);
                let unit = result.Unit;
                let additionalInfo = result.ADDITIONAL_INFO;

                // For table value
                totalCons += value;
                runningTime += result.RUNNING_MINS;

                seriesArray.push({ x: ticks, y: value, unit: unit, additionalInfo: additionalInfo });
            }

            addSingleSeriesIntoChart(seriesArray, seriesName, chartLineType);
            finalTotalCons += totalCons;
            finalRunningTime += runningTime;

            let hours = Math.floor(runningTime / 60);
            let minutes = runningTime % 60;
            avgConsRate = round(parseFloat(totalCons / parseFloat(runningTime / 60)), 2);

            htmlString += "<tr>";
            htmlString += "<td>" + key + "</td>";
            htmlString += "<td>" + numberWithCommas(round(totalCons, 2)) + "</td>";
            htmlString += "<td>" + hours + " Hrs " + minutes + " Mins" + "</td>";
            htmlString += "<td>" + numberWithCommas(avgConsRate) + "</td>";
            htmlString += "</tr>";
        });

        let hours = Math.floor(finalRunningTime / 60);
        let minutes = finalRunningTime % 60;
        finalAvgConsRate = round(parseFloat(finalTotalCons / parseFloat(finalRunningTime / 60)), 2);

        htmlString += "<tr>";
        htmlString += "<td>All Engine(s)</td>";
        htmlString += "<td>" + numberWithCommas(round(finalTotalCons, 2)) + "</td>";
        htmlString += "<td>" + hours + " Hrs " + minutes + " Mins" + "</td>";
        htmlString += "<td>" + numberWithCommas(finalAvgConsRate) + "</td>";
        htmlString += "</tr>";
        htmlString += "</table>";

        $("#chartSummary").html(htmlString);

        GetEventLog();

    } catch (ex) {
        console.log(ex);
    }

}

async function btnChart_Analog() {
    generateChartReportView();

    method = "GetAnalogChartByQueryTime";
    let parameters = PARAMETER_COMBINED;
    parameters.querytime = $("#selectInterval").val();
    parameters.startDatetimeStr = $("#startDatetime").val();
    parameters.endDatetimeStr = $("#endDatetime").val();
    parameters.analogType = $("#selectMainType").val();
    try {

        let chartTitle = $("#selectMainType option:selected").text() + " (" + $("#selectInterval option:selected").text() + ")";
        createChart("Analog", chartTitle);
        let data = await ajaxGet(method, parameters);
        let chartLineType = $("#selectChartType").val();
        let firstKey;
        for (let key in data) {
            firstKey = key;
            break;
        }
        let htmlString = createTableHeaders("Analog", data[firstKey][0].Unit);

        $.each(data, function (key, value) {
            let seriesArray = [];
            let series = value;
            let seriesName = key;
            let totalValue = 0;
            let lastValue = 0;
            let avgValue = 0;

            for (let i = 0; i < series.length; i++) {
                let result = series[i];
                let value = round(parseFloat(result.CONVERTED_VALUE), 2);
                let ticks = parseFloat(result.Ticks);
                let unit = result.Unit;

                totalValue += value;
                seriesArray.push({ x: ticks, y: value, unit: unit });

                if (i === series.length - 1) {
                    lastValue = value;
                }
            }

            addSingleSeriesIntoChart(seriesArray, seriesName, chartLineType);
            totalValue = round(totalValue, 2);
            avgValue = round(parseFloat(totalValue / series.length), 2);

            htmlString += "<tr>";
            htmlString += "<td>" + key + "</td>";
            htmlString += "<td>" + numberWithCommas(totalValue) + "</td>";
            htmlString += "<td>" + numberWithCommas(avgValue) + "</td>";
            htmlString += "<td>" + numberWithCommas(lastValue) + "</td>";
            htmlString += "</tr>";
        });

        htmlString += "</table>";

        $("#chartSummary").html(htmlString);

        GetEventLog();

    } catch (ex) {
        console.log(ex);
    }

}

async function GetEventLog() {
    let method = "GetAllEventsByQuery";
    let parameters = PARAMETER_COMBINED;
    parameters.startDatetimeStr = $("#startDatetime").val();
    parameters.endDatetimeStr = $("#endDatetime").val();
    try {
        let data = await ajaxGet(method, parameters);
        let htmlString = "";
        for (let i = 0; i < data.length; i++) {
            let result = data[i];
            htmlString += "<div>";
            htmlString += "<p>" + result.Datetime + "</p>";
            htmlString += "<p>" + result.EventType + "</p>";
            htmlString += "<p>" + result.EventDesc + "</p>";
            htmlString += "</div>";
        }

        $("#eventContainer").html(htmlString);

    } catch (ex) {
        console.log(ex);
    }
}

async function btnMap_Position() {
    await generatePositionReportView();
    let method = "GetPositionByQuery";

    let parameters = PARAMETER_COMBINED;
    parameters.querytime = $("#selectInterval").val();
    parameters.startDatetimeStr = $("#startDatetime").val();
    parameters.endDatetimeStr = $("#endDatetime").val();
    parameters.eventType = $("#checkboxInput").is(":checked") ? 1 : 0;

    try {
        let data = await ajaxGet(method, parameters);
        globalPositionData = data;
        await initMap("map");
        insertMapMarkersWithEvents(data, MAP);
        addPolylinesToMap(data);
        addPositionTable(data);

    } catch (ex) {
        console.log(ex);
    }
}

function drawMap(data) {
    let latLonArray = [];
    $.each(data, function (key, value) {
        let currentArray = [parseFloat(value.Latitude), parseFloat(value.Longitude)];
        latLonArray.push(currentArray);
        setDirectionIcon(value);

    });
    if (latLonArray.length > 1) {
        drawPolylineOnMap(latLonArray, MAP);
        setStartEndMarkerOnPopupMap(data, MAP);
    } else {
        insertMapMarkers(latLonArray, MAP);
    }

}

function addPolylinesToMap(data) {
    var latLonArray = [];
    $.each(data, function (indexInArray, valueOfElement) {
        var currentArray = [parseFloat(valueOfElement.Latitude), parseFloat(valueOfElement.Longitude)];
        latLonArray.push(currentArray);
    });

    drawPolylineOnMap(latLonArray, MAP);
    setStartEndMarkerOnPositionMap(latLonArray, MAP);
}


function createTableHeaders(type, unit) {
    let htmlString = "<table><tr>";
    if (type === "Engine") {
        htmlString += "<th>Engine</th>";
        htmlString += "<th>Total Cons. (ℓ)</th>";
        htmlString += "<th>Running Time</th>";
        htmlString += "<th>Est. Cons Rate (ℓ/hr)</th>";
    } else if (type === "Bunker") {
        htmlString += "<th>Engine</th>";
        htmlString += "<th>Total Flow (ℓ)</th>";
        htmlString += "<th>Running Time</th>";
        htmlString += "<th>Est. Flow Rate (ℓ/hr)</th>";
    } else if (type === "Analog") {
        htmlString += "<th>Analog</th>";
        htmlString += "<th>Peak Value (" + unit + ")</th>";
        htmlString += "<th>Est. Avg. Value (" + unit + ")</th>";
        htmlString += "<th>Last Value (" + unit + ")</th>";
    }

    htmlString += "</tr>";

    return htmlString;
}

function createChart(chartType, chartTitle) {
    let options;

    if (chartType === "Engine") {
        options = {
            chart: {
                type: "line",
                style: {
                    'fontFamily': 'Tahoma'
                }
            },
            title: {
                text: chartTitle
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
                    var formatter = tooltipFormatter(this, chartType);
                    return formatter;
                }
            }
        };
    } else if (chartType === "Analog") {
        options = {
            chart: {
                type: "line",
                style: {
                    'fontFamily': 'Tahoma'
                }
            },
            title: {
                text: chartTitle
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
                    var formatter = tooltipFormatter(this, chartType);
                    return formatter;
                }
            }
        };
    }


    $("#chart").highcharts($.extend(true, {}, options));
}

function addSingleSeriesIntoChart(seriesArray, seriesName, chartType) {
    $("#chart").highcharts().addSeries({
        type: chartType,
        name: seriesName,
        data: seriesArray
    });
}

function tooltipFormatter(chart, chartType) {
    var dateFormatHC = '%d-%b-%y %H:%M:%S';
    var rateText = "";
    var formatter = "";
    if (chartType === "Engine") {
        rateText = "Total Consumption : ";

        formatter = "<b>" + chart.series.name + "</b><br>" +
            Highcharts.dateFormat(dateFormatHC, chart.x) + "<br>" +
            rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit + "<br>"
            + chart.point.additionalInfo;

    } else if (chartType === "Analog") {
        rateText = "Value : ";

        formatter = "<b>" + chart.series.name + "</b><br>" +
            Highcharts.dateFormat(dateFormatHC, chart.x) + "<br>" +
            rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit + "<br>";
    }


    return formatter;
}

function generateChartReportView() {
    let htmlString = "";
    htmlString += "<div id='chart' class='chart'></div>";
    htmlString += "<div class='chart-item'>";
    htmlString += "<div class='chart-summary' id='chartSummary'>";
    htmlString += "</div>";
    htmlString += "<div class='event-container' id='eventContainer'></div>";
    htmlString += "</div>";

    $("#resultContainer").html(htmlString);
}

function generatePositionReportView() {
    let htmlString = "";
    htmlString += "<div class='position-container'>";
    htmlString += "<div class='map-container'>";
    htmlString += "<div id='map'></div>";
    htmlString += "</div>";
    htmlString += "<div class='table-container' id='tableContainer'></div>";
    htmlString += "</div>";

    $("#resultContainer").html(htmlString);
}

function addPositionTable(data) {
    let htmlString = "";
    htmlString = "<table>";
    htmlString += "<tr>";
    htmlString += "<th style='display:none'></th>";
    htmlString += "<th>Date Time</th>";
    htmlString += "<th>Location</th>";
    htmlString += "<th>SOG</th>";
    htmlString += "<th>COG</th>";
    htmlString += "<th>Est. Dist (Nm)</th>";
    htmlString += "<th>Event(s)</th>";
    htmlString += "</tr>";
    let count = 0;
    let pageCount = 1;
    var currentRowCount = 1;
    $.each(data, function (key, value) {
        if (currentRowCount > maxTableRows) {
            pageCount++;
            currentRowCount = 1;
        }
        if (count < maxTableRows) {
            htmlString += "<tr id='table-" + count + "'>";
        } else {
            htmlString += "<tr id='table-" + count + "' style='display:none;'>";
        }

        let datetime = value.PositionDatetime;
        let location = value.Wgs84Lat + " " + value.Wgs84Lon;
        let sog = value.Sog;
        let cog = value.Cog;
        let distance = round(value.TotalDistance, 2);
        let eventImage = "";
        let events = value.EventDesc;
        if (events !== '') {
            eventImage = "<img src='../img/event_listing.png' class='event-image'/>";
        }

        htmlString += "<td style='display:none' id='" + count + "'>" + count + "</td>";
        htmlString += "<td>" + datetime + "</td>";
        htmlString += "<td>" + location + "</td>";
        htmlString += "<td>" + sog + "</td>";
        htmlString += "<td>" + cog + "</td>";
        htmlString += "<td>" + distance + "</td>";
        htmlString += "<td>" + eventImage + "</td>";
        htmlString += "</tr>";
        count++;
        currentRowCount++;
    });

    htmlString += "</table>";
    htmlString += '<div class="table-pagination"><i class="fa fa-arrow-circle-left fa-2x" aria-hidden="true" id="backPagination"></i><p>Page</p><p id="currentTablePage">1</p><p> of </p><p id="totalTablePage">1</p><i class="fa fa-arrow-circle-right fa-2x" aria-hidden="true" id="forwardPagination"></i></div>';

    $("#tableContainer").html(htmlString);
    $("#totalTablePage").text(pageCount);
    paginationTable(maxTableRows);

}
