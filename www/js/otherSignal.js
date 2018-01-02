$(document).ready(function () {
    mainfunction();

});

async function mainfunction(){
    await getUserRelatedFleets();
    await getUserRelatedVessels();
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
				TEMP_VESSELID = key;
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