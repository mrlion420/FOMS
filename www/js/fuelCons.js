$(document).ready(function () {
    mainFunction();
   
});

async function mainFunction(){
    await getUserRelatedFleets();
    await getUserRelatedVessels();
    await getAllEngineTypes();
    await GetCurrentEngineData();

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

async function getAllEngineTypes(){
    var method = "GetAllEngineTypes";
    resetConstArrays();
    try{
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateAllEngineTypesToSelect(data);
        populateEngineBody(data);
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

function populateEngineBody(data){
    var htmlString = "";
    for(var i = 0; i < data.length; i++){
        var result = data[i];
        // Create a div with 'engineNameBody' id
        if(i === data.length - 1){
            htmlString += "<div class='engine-body' id='" + removeSpace(result.Result) + "Body'></div>";
        }else{
            htmlString += "<div class='engine-body splitter-bottom' id='" + removeSpace(result.Result) + "Body'></div>";
        }
    }
    $("#wrapper").html(htmlString);
}

async function GetCurrentEngineData(){
    var method = "GetCurrentEngineData";
    resetConstArrays();
    try{
        let data = await ajaxGet(method, PARAMETER_VESSELID);
        populateCurrentEngineData(data);
    }catch(ex){
        console.log(ex);
    }
}

function populateCurrentEngineData(data){
    var oldEngineType = null;
    for(var i = 0; i < data.length; i++){
        var htmlString = "";
        var result = data[i];
        var consumption = numberWithCommas(round(parseFloat(result.EstCons), 2));
        if(oldEngineType !== result.EngineType){
            oldEngineType = result.EngineType;
            htmlString += "<h1>" + result.EngineType + "</h1>";
        }
        htmlString += "<div class='engine-item'>";
        htmlString += "<canvas id='" +  result.EngineId + "Canvas'></canvas>";
        htmlString += "<div class='engine-desc'>";
        htmlString += "<h2>" + result.EngineName + "</h2>";
        htmlString += "<div class='engine-value'>";
        htmlString += "<p>Cons Rate.</p>";
        htmlString += "<p>" + consumption + "</p>";
        htmlString += "</div>"; // Close Engine Value
        htmlString += "<div class='engine-value'>";
        htmlString += "<p>Running Mins : </p>";
        htmlString += "<p>" + result.RunningMins + "</p>";
        htmlString += "</div>"; // Close Engine Value
        htmlString += "</div>"; // Close engine desc
        htmlString += "</div>"; // Close engine item
        $("#" + removeSpace(result.EngineType) + "Body").append(htmlString);
        createRadialGauge(result.EngineId + "Canvas", consumption);
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

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
        VESSELID = TEMP_VESSELID;
        submitBtnFunctions();
    });
}

async function submitBtnFunctions(){
    await getAllEngineTypes();
    await GetCurrentEngineData();
}

function selectDropdownChangeEvent(){
    $("#fleetSelect").change(function(){
        FLEETID = $("#fleetSelect").val();
        getUserRelatedVessels();
    });

    $("#vesselSelect").change(function(){
        TEMP_VESSELID = $("#vesselSelect").val();
    });

    // $("#engineTypeSelect").change(function(){
    //     SELECTED_ENGINE_TYPE = $("#engineTypeSelect").val();
    //     var htmlString = "";
    //     switch (SELECTED_ENGINE_TYPE) {
    //         case "4":
    //             htmlString = "Est. Consumption Rate (ℓ/hr)";
    //             break;

    //         default:
    //             htmlString = "Fuel Cons. Rate (ℓ/hr)";
    //             break;
    //     }
    //     $("#chartTitle").html(htmlString);
    //     createEngineChartByEngineType();
    //     getEngineTotalAndEstConsumption();
    // });
}

