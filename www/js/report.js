$(document).ready(function () {
    loadSelectMainContainer();
    selectChangeEventHandler();
});

function loadSelectMainContainer() {
    var reportType = $("#selectReportType").val();
    $("#selectMainContainer").html("");
    $("#selectMainContainer").load("/report_items/" + reportType + ".html", function () {
        loadDatetimePickers();
    });
}

function selectChangeEventHandler() {
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
    var format = "d-M-y H:i";

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
    var data, method;
    var reportType = $("#selectReportType").val();
    switch (reportType) {
        case "FuelCons_Report":
            method = "GetAllEngineTypes"
            break;
    }

}
