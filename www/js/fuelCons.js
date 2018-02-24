$(document).ready(function () {
	mainFunction();
   
});

var syncChartArray = [];

async function mainFunction(){
	hideChartViews();
	await getUserRelatedFleets();
	await getUserRelatedVessels();

	await getAllEngineTypes();
	await GetCurrentEngineData();
	await GetCurrentAnalogData();
	
	await getAllEngines();

	selectDropdownChangeEvent();
	submitBtnClickHandler();
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
				location.reload();
			}            
            break;
            
        }
    }
}

async function getAllEngines(){
	var method = "GetAllEngines";
	try{    
		let data = await ajaxGet(method, PARAMETER_VESSELID);
		populateAllEngines(data);
	}catch(ex){
		console.log(ex);
	}
}

function populateAllEngines(data){
	var htmlString = "";
	for(var i = 0; i < data.length; i++){
		var result = data[i];
		htmlString += "<option value='" + result.EngineId + "'>" + result.EngineName + "</option>";
	}
	$("#engineIdSelect").html(htmlString);
}

async function getAllEngineTypes(){
	var method = "GetAllEngineTypes";
	try{
		let data = await ajaxGet(method, PARAMETER_VESSELID);
		populateEngineBody(data);
	}catch(ex){
		console.log(ex);
	}
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
		htmlString += "<div class='engine-item' id='" + result.EngineId + "Item'>";
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
		width: 280,
		height: 180,
		minValue: 0,
		maxValue: 200,
		value: value,
		units: "litres",
		colorValueBoxShadow: false,
		highlights: [
			{ "from": 0, "to": 75, "color": "rgba(0,255,0,.15)" },
			{ "from": 75, "to": 150, "color": "rgba(255,255,0,.15)" },
			{ "from": 150, "to": 200, "color": "rgba(255,30,0,.25)" }
		],
		majorTicks: ["0", "20", "40", "60", "80", "100", "120", "140", "160", "180", "200"],
		minorTicks: 5
	}).draw();
}

async function GetCurrentAnalogData(){
	var method = "GetCurrentAnalogData";
	//resetConstArrays();
	try{
		let data = await ajaxGet(method, PARAMETER_VESSELID);
		
		populateAnalogData(data);
	}catch(ex){
		console.log(ex);
	}
}

function populateAnalogData(data){
	for(var i = 0 ; i < data.length; i++){
		var analogDataList = data[i];
		var htmlString = "";
		for(var j = 0; j < analogDataList.length; j++){
			var result = analogDataList[j];
			var refEngineId = result.RefEngineId;
			htmlString = "<div class='engine-desc'>";
			htmlString += "<h2 class='hidden'>Analog</h2>";
			htmlString += "<div class='engine-value'>";
			htmlString += "<p>" + result.AnalogType + "</p>";
			htmlString += "<p>" + result.AnalogValue + "</p>";
			htmlString += "</div>"; // End of engine value tag
			j++;
			if( j < analogDataList.length){
				htmlString += "<div class='engine-value'>";
				htmlString += "<p>" + result.AnalogType + "</p>";
				htmlString += "<p>" + result.AnalogValue + "</p>";
			}else{
				htmlString += "<div class='engine-value'>";
				htmlString += "<p class='hidden'>" + result.AnalogType + "</p>";
				htmlString += "<p class='hidden'>" + result.AnalogValue + "</p>";
			}
			htmlString += "</div>"; // End of engine desc tag
			$("#" + removeSpace(refEngineId) + "Item").append(htmlString);
		}
	}
}

async function GetSynchornizedChartByEngineId(){
	var method = "GetSynchornizedChartByEngineId";
	var parameters = PARAMETER_VESSELID;
	parameters.timezone = TIMEZONE;
	parameters.querytime = $("#querySelect").val();
	parameters.engineId = $("#engineIdSelect").val();
	parameters.includeRefSignal = $('#checkboxInput').is(":checked");
	// parameters.includeRefSignal = "true";
	
	try{
		let data = await ajaxGet(method, parameters);
		populateChartData(data);
	}catch(ex){
		console.log(ex);
	}
	resetConstArrays();
}

function populateChartData(data) {
	// Reset the containers and the sync chart array
	$("#chartValues").html("");
	$("#chartContainer").html("");
	syncChartArray = [];

	var uniqueId = 0;
	var chartType = "spline";
	$.each(data, function (key, valueOfKey) {
		var series = valueOfKey;
		var seriesArray = [];
		var maxValue = 0;
		var minValue = 99999;
		var totalValue = 0;
		var lastValue = 0;
		for (var i = 0; i < series.length; i++) {
			var result = series[i];
			var value;
			var ticks = parseFloat(result.Ticks);
			if (uniqueId === 0) {
				// Engine chart
				value = round(parseFloat(result.EST_FLOW_RATE), 2);
			} else {
				value = round(parseFloat(result.CONVERTED_VALUE), 2);
			}

			var unit = result.Unit;
			maxValue = getMaxValue(maxValue, value);
			minValue = getMinValue(minValue, value);
			totalValue += value;

			if (i === series.length - 1) {
				lastValue = value;
			}
			seriesArray.push({ x: ticks, y: value, unit: unit });
		}
		var averageValue = getAverageValue(totalValue, series.length);
		createChart(key, uniqueId);
		addSingleSeriesIntoChart(seriesArray, key, chartType, uniqueId);
		insertChartItemValues(uniqueId, minValue, maxValue, averageValue, lastValue);
		uniqueId++;

	});

	$('#chartContainer').bind('mousemove touchmove touchstart', function (e) {
		var chart,
			point,
			i,
			event;

		for (i = 0; i < syncChartArray.length; i = i + 1) {
			chart = syncChartArray[i];
			event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
			point = chart.series[0].searchPoint(event, true); // Get the hovered point

			if (point) {
				point.select(e);
			}
		}
	});
	
}

function insertChartItemValues(uniqueId, minValue, maxValue,averageValue, lastValue){
	var htmlString = "";
	htmlString = "<div class='chart-item'>";
	htmlString += "<div class='main-value'>";
	var lastValueHeader = "";
	var averageValueHeader = "";
	var maxMinHeader = "";
	switch(uniqueId){
		case 0:
		// Engine or bunker
		var selectedText = $("#engineIdSelect option:selected").text().toLowerCase();
		if(selectedText.indexOf("bunker") !== -1){
			// Bunker
			lastValueHeader = "Est. Flow Rate";
			averageValueHeader = "Average Flow";
			maxMinHeader = "Peak / Lowest Flow";
		}else{
			// Engine
			lastValueHeader = "Est. Consumption Rate";
			averageValueHeader = "Average Consumption";
			maxMinHeader = "Peak / Lowest Consumption";
		}
		break;

		default:
		// Analog
		lastValueHeader = "Current Reading";
		averageValueHeader = "Average Reading";
		maxMinHeader = "Peak / Lowest Reading";
		break;
	}

	htmlString += "<p>" + lastValueHeader + "</p>";
	htmlString += "<p>" + lastValue + "</p>";
	htmlString += "</div>"; // Close Main value
	htmlString += "<div class='normal-value'>";
	htmlString += "<p>" + averageValueHeader + "</p>";
	htmlString += "<p>" + averageValue + "</p>";
	htmlString += "</div>"; // Close normal value
	htmlString += "<div class='normal-value'>";
	htmlString += "<p>" + maxMinHeader + "</p>";
	htmlString += "<p>" + maxValue + " / " + minValue + "</p>";
	htmlString += "</div>"; // Close normal value
	htmlString += "</div>"; // Close chart item

	$("#chartValues").append(htmlString);
}

function getMaxValue(maxValue, currentValue){
	if(currentValue > maxValue){
		return currentValue;
	}else{
		return maxValue;
	}
}

function getMinValue(minValue, currentValue){
	if(currentValue < minValue){
		return currentValue;
	}else{
		return minValue;
	}
}

function getAverageValue(totalValue, count){
	return round(parseFloat(totalValue / count), 2 );
}

function createChart(chartTitle, uniqueId){
	let engineName = $("#engineIdSelect option:selected").text().toLowerCase();
	options = {
		chart: {
			type: "line",
			style: {
				'fontFamily': 'Tahoma'
			}
		},
		title: {
			text: chartTitle,
			margin: 15,
			align : "left",
			x :30
		},
		legend : {
			enabled: false
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
			positioner: function () {
				return {
					x: this.chart.chartWidth - this.label.width, // right aligned
					y: 10 // align to title
				};
			},
			formatter: function () {
				var formatter = tooltipFormatter(this, engineName);
				return formatter;
			}
		}
	};

	$('<div class="chart" id="chart-' + uniqueId + '">').appendTo('#chartContainer').highcharts($.extend(true, {}, options));
	var chart = $("#chart-" + uniqueId ).highcharts();
	syncChartArray.push(chart);
}

function tooltipFormatter(chart, engineName){
	var dateFormatHC = '%d-%b-%y %H:%M:%S';
	var formatter = "";
	var count = 0;
	var rateText = "";
	
	// Id == 0 means, if the chart is for engine.
	// Engine chart series id will always be 0
	if (chart.series.options.id === 0) {
		// Check if the unit is litres, which means that the daily interval is live
		if (chart.point.unit === "ℓ") {
			rateText = "Consumption : ";
		} else {
			if(engineName.indexOf("bunker") !== -1){
				rateText = "Est. Flow Rate : ";
			}else{
				rateText = "Est. Consumption Rate : ";	
			}
		}
		formatter += Highcharts.dateFormat(dateFormatHC, chart.x) + "<br>" +
			rateText + Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit + '<br>';
	} else {
		formatter += Highcharts.dateFormat(dateFormatHC, chart.x) + "<br>" +
			Highcharts.numberFormat(chart.y, 2) + '  ' + chart.point.unit + '<br>';
	}

	return formatter;
}

function addSingleSeriesIntoChart(seriesArray, seriesName, chartType, uniqueId){
	var singleChart = syncChartArray[uniqueId];
	singleChart.addSeries({
		id : uniqueId,
		type: chartType,
		name: seriesName,
		data: seriesArray
	});

}

function submitBtnClickHandler(){
	$("#submitBtn").click(function(){
		viewTypeSelectChangeFunction();
	});
}

async function submitBtnFunctions(){
	await getAllEngineTypes();
	await GetCurrentEngineData();
	await GetCurrentAnalogData();
}

function selectDropdownChangeEvent(){
	$("#fleetSelect").change(function(){
		fleetSelectChangeFunction();
	});

	$("#vesselSelect").change(function(){
		VESSELID = $("#vesselSelect").val();
		resetConstArrays();
		// Check if the engines needed to reloaded or not 
		// By checking if the vessel Id haschanged
	});

	$("#viewTypeSelect").change(function(){
		viewTypeSelectChangeFunction();
	});

	$("#engineIdSelect").change(function(){
		// GetSynchornizedChartByEngineId();
	});

	$("#checkboxInput").change(function(){
		// GetSynchornizedChartByEngineId();
	});
}

async function fleetSelectChangeFunction(){
	FLEETID = $("#fleetSelect").val();
	await getUserRelatedVessels();
	await getAllEngines();
}

async function viewTypeSelectChangeFunction(){
    var viewType = $("#viewTypeSelect").val();
    switch(viewType){
        case "gauges":
        hideChartViews();
        await submitBtnFunctions();
        break;

        case "chart":
        showChartViews();
		await GetSynchornizedChartByEngineId();
        break;
    }
}

function hideChartViews(){
	$("#wrapperChart").addClass("display-none");
	$("#wrapper").addClass("display-flex");
    $("#engineIdSelectDiv").addClass("display-none");
	$("#checkboxDiv").addClass("display-none");
	$("#queryDiv").addClass("display-none");

	$("#wrapperChart").removeClass("display-flex");
	$("#wrapper").removeClass("display-none");
    $("#engineIdSelectDiv").removeClass("display-block");
	$("#checkboxDiv").removeClass("display-block");
	$("#queryDiv").removeClass("display-flex");
}

function showChartViews(){
	$("#wrapperChart").addClass("display-flex");
	$("#wrapper").addClass("display-none");
    $("#engineIdSelectDiv").addClass("display-block");
	$("#checkboxDiv").addClass("display-block");
	$("#queryDiv").addClass("display-flex");
	
	$("#wrapperChart").removeClass("display-none");
	$("#wrapper").removeClass("display-flex");
    $("#engineIdSelectDiv").removeClass("display-none");
	$("#checkboxDiv").removeClass("display-none");
	$("#queryDiv").removeClass("display-none");
}

Highcharts.Pointer.prototype.reset = function () {
	return undefined;
};

Highcharts.Point.prototype.select = function (event) {
	this.onMouseOver();
	this.series.chart.tooltip.refresh(this); // Show the tooltip
	this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair  
};

Highcharts.setOptions({
	lang: {
		thousandsSep: ','
	}
});

function syncExtremes(e) {
	var thisChart = this.chart;

	if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
		Highcharts.each(Highcharts.charts, function (chart) {
			if (chart !== thisChart) {
				if (chart.xAxis[0].setExtremes) { // It is null while updating
					chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
				}
			}
		});
	}
}

