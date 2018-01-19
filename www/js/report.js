$(document).ready(function () {
    mainFunction();
    
});

async function mainFunction(){
    await getUserRelatedFleets();
    await getUserRelatedVessels();

    loadSelectMainContainer();
    selectChangeEventHandler();
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
    var parameters = PARAMETER_USERID;
    parameters.fleetId = FLEETID;
    try{
        let data = await ajaxGet(method, parameters);
        populateVesselSelectBox(data);
    }catch(ex){
        console.log(ex);
    }
    //resetConstArrays();
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
    $("#fleetSelect").change(function(){
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#vesselSelect").change(function(){
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
        for(let i = 0; i < data.length; i++){
            let htmlString = "<option value='" + data[i].Key + "'>" + data[i].Result + "</option>";
            $("#selectMainType").append(htmlString);
        }
    } 

}

function removeDatetimePickers(){
    $("#startDatetime").datetimepicker('destroy');
    $("#endDatetime").datetimepicker('destroy');
}
