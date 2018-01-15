$(document).ready(function () {
    loadSelectMainContainer();
    selectChangeEventHandler();
});

function loadSelectMainContainer(){
    var reportType = $("#selectReportType").val();
    $("#selectMainContainer").html("");
    $("#selectMainContainer").load("/report_items/" + reportType + ".html" , function(){
        loadDatetimePickers(); 
    });
}

function selectChangeEventHandler(){
    $("#selectReportType").change(function(){
        loadSelectMainContainer();
    });
}

function loadDatetimePickers(){
    var todayString = "01-01-17 20:20";
    $("#startDatetime").datetimepicker({
        value : todayString,
		format : "d-M-y H:i"
    });
    $("#endDatetime").datetimepicker({
        value : todayString,
		format : "d-M-y H:i"
    });
}
