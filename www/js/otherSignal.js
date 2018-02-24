$(document).ready(function () {
    mainfunction();

});

var maxTableRows = 8;

async function mainfunction(){
	tablePaginationClickHandler(maxTableRows);
	selectDropdownChangeEvent();
	submitBtnClickHandler();

    await getUserRelatedFleets();
	await getUserRelatedVessels();
	await GetCurrentAlarmStatus();
	await GetIOAlarmByQuery();
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

function submitBtnClickHandler(){
    $("#submitBtn").click(function(){
		GetCurrentAlarmStatus();
		GetIOAlarmByQuery();
	});
	
}

function selectDropdownChangeEvent(){
	$("#querySelect").change(function(){
		GetIOAlarmByQuery();
	});

	$("#fleetSelect").change(function () {
		fleetSelectChangeFunction();
	});

	$("#vesselSelect").change(function () {
		VESSELID = $("#vesselSelect").val();
		// Check if the analogs needed to reloaded or not 
		// By checking if the vessel Id has changed
		//reloadAllAnalog();
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

async function GetIOAlarmByQuery(){
	var method = "GetIOAlarmByQuery";
	var parameters = PARAMETER_COMBINED;
	parameters.querytime = $("#querySelect").val();
	// parameters.querytime = 990;
	try{
		let data = await ajaxGet(method, parameters);
		populateIOAlarmTable(data);
	}catch(ex){
		console.log(ex);
	}
}

function populateIOAlarmTable(data){
	var htmlString = "<table>";
	htmlString += "<tr>";
	htmlString += "<th>Date Time</th>";
	htmlString += "<th>Description</th>";
	htmlString += "<th>Location</th>";
	htmlString += "</tr>";
	var currentRowCount = 1;
	var pageCount = 1;
	for(var i = 0; i < data.length; i++){
		if(currentRowCount > maxTableRows){
			pageCount++;
			currentRowCount = 1;
		}
		if(i < maxTableRows){
			htmlString += "<tr id='table-" + i + "'>";	
		}else{
			htmlString += "<tr id='table-" + i + "' style='display:none;'>";	
		}

		var result = data[i];
		htmlString += "<td>";
		htmlString += result.AlarmDateTime;
		htmlString += "</td>";
		htmlString += "<td>";
		htmlString += result.AlarmDescription;
		htmlString += "</td>";
		htmlString += "<td>";
		htmlString += result.Location;
		htmlString += "</td>";
		htmlString += "</tr>";
		currentRowCount++;
	}
	htmlString += "</table>";
	$("#totalTablePage").text(pageCount);
	$("#tableContainer").html(htmlString);
	paginationTable(maxTableRows);
}

async function fleetSelectChangeFunction() {
	FLEETID = $("#fleetSelect").val();
	await getUserRelatedVessels();
}