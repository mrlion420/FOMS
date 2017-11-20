$(document).ready(function () {
    mainFunction();
});

async function mainFunction(){
    await getUserRelatedFleets();
    await getUserRelatedVessels();
    await getAllEngineTypes();

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

