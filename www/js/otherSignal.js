$(document).ready(function () {
    mainfunction();

});

async function mainfunction(){
    await getUserRelatedFleets();
	await getUserRelatedVessels();
	await GetCurrentAlarmStatus();
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

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
        
    });
}

async function GetCurrentAlarmStatus(){
	var method = "GetCurrentAlarmStatus";
	var parameters = PARAMETER_COMBINED;
	try{
		let data = await ajaxGet(method, parameters);
		populateCurrentAlarmStatus(data);
	}catch(ex){
		console.log(ex);
	}
}

function populateCurrentAlarmStatus(data){
	$("#signalStatusContainer").html("");
	for(var i = 0; i < data.length; i++){
		var result = data[i];
		var htmlString = "<div>";
		htmlString += "<p>" + result.Description + "</p>";
		if(result.AlarmStatus){
			htmlString += '<i class="fa fa-toggle-on fa-2x no-alarm" aria-hidden="true"></i>';
		}else{
			htmlString += '<i class="fa fa-toggle-off fa-2x alarm" aria-hidden="true"></i>';
		}
		htmlString += "<p>" + result.AlarmDescription  + "</p>";
		htmlString += "<p>" + result.AlarmDateTime  + "</p>";
		htmlString += "</div>";
		$("#signalStatusContainer").append(htmlString);
	}
}