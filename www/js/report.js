$(document).ready(function () {
    mainFunction();

});

async function mainFunction() {
    await getUserRelatedFleets();
    await getUserRelatedVessels();

    loadSelectMainContainer();
    selectChangeEventHandler();
    buttonClickHandler();
}

async function getUserRelatedFleets() {
    var method = "GetUserRelatedFleets";
    try {
        let data = await ajaxGet(method, PARAMETER_USERID);
        populateFleetSelectBox(data);
    } catch (ex) {
        console.log(ex);
    }
}

function populateFleetSelectBox(data) {
    var isFirstItem = true;
    var htmlString = "";
    $.each(data, function (index, valueInElement) {
        var key = data[index].Key;
        var value = data[index].Result;
        if (isFirstItem) {
            htmlString += "<option value='" + key + "' selected>" + value + "</option>";
            FLEETID = key;
            isFirstItem = false;
        } else {
            htmlString += "<option value='" + key + "'>" + value + "</option>";
        }

    });
    $("#fleetSelect").html(htmlString);
}

async function getUserRelatedVessels() {
    var method = "GetUserRelatedVessels";
    var parameters = PARAMETER_USERID;
    parameters.fleetId = FLEETID;
    try {
        let data = await ajaxGet(method, parameters);
        populateVesselSelectBox(data);
    } catch (ex) {
        console.log(ex);
    }
    //resetConstArrays();
}

function populateVesselSelectBox(data) {
    var isFirstItem = true;
    var htmlString = "";

    $.each(data, function (index, valueInElement) {
        var key = data[index].Key;
        var value = data[index].Result;
        if (isFirstItem) {
            htmlString += "<option value='" + key + "' selected>" + value + "</option>";
            if (PAGELOAD) {
                VESSELID = key;
                PAGELOAD = false;
            } else {
                TEMP_VESSELID = key;
            }
            isFirstItem = false;
        } else {
            htmlString += "<option value='" + key + "'>" + value + "</option>";
        }

    });
    resetConstArrays();
    $("#vesselSelect").html(htmlString);
}

function loadSelectMainContainer() {
    removeDatetimePickers();

    var reportType = $("#selectReportType").val();
    $("#selectMainContainer").html("");
    $("#selectMainContainer").load("/report_items/" + reportType + ".html", function () {
        loadDatetimePickers();
        loadMainSelectType();
    });
}

function selectChangeEventHandler() {
    $("#fleetSelect").change(function () {
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#vesselSelect").change(function () {
        VESSELID = $("#vesselSelect").val();
    });

    $("#selectReportType").change(function () {
        loadSelectMainContainer();
    });

    $("#selectMainContainer").on("change", "#selectInterval", function () {
        changeDatetimeFormat();
    });

}

async function loadDatetimePickers() {

    var method = "GetCurrentDatetime";
    var parameters = PARAMETER_USERID;
    parameters.timezone = TIMEZONE;
    try {
        let data = await ajaxGet(method, parameters);
        insertDatetime(data);

    } catch (ex) {
        console.log(ex);
    }

}

function insertDatetime(data) {

    var startDateString = data.StartDatetime;
    var endDateString = data.EndDatetime;
    var format = "d-M-y";

    $("#startDatetime").datetimepicker({
        value: startDateString,
        format: format
    });
    $("#endDatetime").datetimepicker({
        value: endDateString,
        format: format
    });
}

function changeDatetimeFormat() {
    var interval = $("#selectInterval").val();
    var format = "";
    switch (interval) {
        case "24":
            format = "d-M-y";
            break;

        default:
            format = "d-M-y H:i";
            break;
    }

    $("#startDatetime").datetimepicker({
        format: format
    });
    $("#endDatetime").datetimepicker({
        format: format
    });
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
        for(let key in data){
            firstKey = key;
            break;
        }
        let htmlString = createTableHeaders("Analog" , data[firstKey][0].Unit);

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
