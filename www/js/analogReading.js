$(document).ready(function () {
    mainFunction();
});

async function mainFunction(){
    await getUserRelatedFleets();
    await getUserRelatedVessels();
    await GetCurrentAnalogData();

    selectDropdownChangeEvent();
    submitBtnClickHandler();
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

async function GetCurrentAnalogData(){
    var method = "GetCurrentAnalogData";
    resetConstArrays();
    try{
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateAnalogData(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateAnalogData(data){
    $("#analogBody").html("");
    for(var i = 0; i < data.length; i++){
        var analogDataList = data[i];
        for(var j = 0; j < analogDataList.length; j++){
            var htmlString = "";
            var result = analogDataList[j];
            var imgUrl = "../img/tick.png";
            var cssClass = "no-alarm";
            if(result.AlarmStatus === "1"){
                imgUrl = "../img/cross.png";
                cssClass = "alarm";
            }

            htmlString += "<div class='analog-item'>";
            htmlString += "<canvas id='" + result.AnalogId + "Canvas'></canvas>";
            htmlString += "<div class='analog-desc'>";
            htmlString += "<div class='analog-desc-item'>";
            htmlString += "<p class='" + cssClass + "'>" + result.AnalogName + "</p>";
           
            htmlString += "<img src='" + imgUrl + "'/>";
            htmlString += "</div>";
            htmlString += "<div class='analog-desc-item'>";
            htmlString += "<p>Reading : </p>";
            htmlString += "<p class='" + cssClass + "'>" + result.AnalogValue + "</p>";
            htmlString += "</div>";
            htmlString += "</div>";
            htmlString += "</div>";
            $("#analogBody").append(htmlString);
            createRadialGauge(result.AnalogId + "Canvas" , result.AnalogValue);
        }

    }
}

function createRadialGauge(id, value){
    var gauge = new RadialGauge({
       renderTo: id,
       width : 280,
       height: 180,
       minValue : 0,
       maxValue : 200,
       value : value,
       units: "litres",
       colorValueBoxShadow: false,
       highlights: [
           { "from": 0, "to": 75, "color": "rgba(0,255,0,.15)" },
           { "from": 75, "to": 150, "color": "rgba(255,255,0,.15)" },
           { "from": 150, "to": 200, "color": "rgba(255,30,0,.25)" }
       ],
       majorTicks : ["0","20","40","60","80","100","120","140","160","180","200"],
       minorTicks : 5
   }).draw();
}

function selectDropdownChangeEvent(){
    $("#fleetSelect").change(function(){
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#vesselSelect").change(function(){
        TEMP_VESSELID = $("#vesselSelect").val();
    });
}

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
        submitBtnFunctions();
    }); 
}

async function submitBtnFunctions(){
    var viewType = $("#viewTypeSelect").val();
    switch(viewType){
        case "gauges":
        VESSELID = TEMP_VESSELID;
        await GetCurrentAnalogData();
        break;

        case "chart":
        VESSELID = TEMP_VESSELID;
        break;
    }
}