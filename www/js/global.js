$(document).ready(function(){
	loadSideMenu();
});

// GLOBAL VARIABLES
const WEBSERVICEHOST = "http://203.118.57.237:1703/FOMSWebService.svc/";
const MENU_ID = [
	"itemFleet",
	"itemVessel",
	"itemFuelCons",
	"itemLoading",
	"itemAnalog",
	"itemOtherSignal",
	"itemReports",
	"itemEventBook",
	"itemSettings"
];

const MENU_PAGE = [
	"fleetDashboard.html",
	"vesselDashboard.html",
	"fuelcons.html"
];
var PAGELOAD = true;
var INTERVAL_ARRAY = [];
// Feature group that contains all the polylines
var FEATURE_GROUP = null;
// Map object 
var MAP = null;
// Map marker object
var MAP_MARKER = null;
// Timezone 
var TIMEZONE = 8;
var USERID = 3;
var COMPANYID = 0;
var FLEETID = 0;
var VESSELID = 0;
var TEMP_VESSELID = 0;
const DELIMITER = ";";

var PARAMETER_USERID = { userId: USERID };
var PARAMETER_TIMEZONE = { timezone: TIMEZONE };
var PARAMETER_VESSELID = { vesselId: VESSELID };
var PARAMETER_COMBINED = { vesselId: VESSELID, timezone: TIMEZONE };

function resetConstArrays(){
	PARAMETER_USERID = { userId: USERID };
	PARAMETER_TIMEZONE = { timezone: TIMEZONE };
	PARAMETER_VESSELID = { vesselId: VESSELID };
	PARAMETER_COMBINED = { vesselId: VESSELID, timezone: TIMEZONE };
}

function ajaxPost(methodName){
    var url = WEBSERVICEHOST + methodName;
    return $.ajax({
        type: "POST",
        url: url,
        dataType: "json"
    });
}

function ajaxGet(methodName , data){
    var url = WEBSERVICEHOST + methodName;
    if (data === null) {
        return $.ajax({
            type: "GET",
            url: url,
            dataType: "json"
        });
    } else {
        return $.ajax({
            type: "GET",
            url: url,
            data: data,
            dataType: "json"
        });
    }
}

function loadSideMenu(){
	$("#sideMenu").load("/main/menu.html" , function(){
		displaySelectedTab();
		sideMenuClick();
	});
}

function displaySelectedTab(){
	for(var i = 0; i < MENU_ID.length; i++){
		if(MENU_PAGE[i] === getCurrentPage()){
			$("#" + MENU_ID[i]).addClass("selected");
		}
	}
}

function sideMenuClick(){
	$("#sideMenu .wrapper").on('click', 'div', function(){
		var menuId = MENU_ID.indexOf(this.id);
		redirectPageWithReturn("/main/" + MENU_PAGE[menuId]);
	});
}

function getCurrentPage(){
	var currentUrl = window.location.href;
	var lastIndex = currentUrl.lastIndexOf("/");
	var currentPage = currentUrl.substring(lastIndex + 1);
	return currentPage;
}

function redirectPageWithoutReturn(url){
	window.location.replace(url);
}

function redirectPageWithReturn(url){
	window.location.href = url;
}

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function roundWithZero(value, decimals){
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
}

function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function removeCommas(x){
	x=x.replace(/\,/g,'');
	return x;
}

function clearIntervalArray (){
    $.each(INTERVAL_ARRAY, function (indexInArray, valueOfElement) {
        clearInterval(valueOfElement);
    });
}

function refreshPage(){
	location.reload();
}

function customAlert(title, message, redirect , redirectUrl){
	if(redirect){
		$("#dialog").dialog({
		width: 400,
			modal: true,
			title: title,
			open:function(){
				$(this).html(message);
			},
			buttons:[
				{
				text: "Ok",
				click:function(){
					window.location.replace(redirectUrl);
					$(this).dialog("close");
				}
			}
		]
	});
	}else{
		$("#dialog").dialog({
			width: 400,
			modal: true,
			title: title,
			open:function(){
				$(this).html(message);
			},
			buttons:[
				{
					text: "Ok",
					click:function(){
						$(this).dialog("close");
					}
				}
			]
		});
	}
}

function setStartEndMarkerOnPopupMap(latlonArray, map){
	var startLat = latlonArray[0].Latitude;
	var startLon = latlonArray[0].Longitude;

	var icon = L.icon({
		iconUrl: '../img/start_vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	var startMapMarker = new  L.marker([startLat, startLon], { icon: icon });
	startMapMarker.addTo(map);

	//Get the latest entry inside the array
	var endLat = latlonArray[latlonArray.length - 1].Latitude;
	var endLon = latlonArray[latlonArray.length - 1].Longitude;

	icon = L.icon({
		iconUrl: '../img/vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	endMapMarker = new  L.marker([endLat, endLon], { icon: icon });
	endMapMarker.addTo(map);

}

function drawPolylineOnMap(latlonArray , map , isInFeatureGroup){
    var polylineGroup = [];
	//  -1 the length of the array, since the drawing of polyline uses two index of the array
	//  First index will be the starting point and the second one will be the ending point
	for(var i =0; i < latlonArray.length -1; i++){
        var startPointArray = latlonArray[i];
        var endPointArray = latlonArray[i + 1];
        var startPoint = new L.LatLng(startPointArray[0], startPointArray[1]);
        var endPoint = new L.LatLng(endPointArray[0], endPointArray[1]);

        var pointList = [startPoint, endPoint];
		var polyline = new L.polyline(pointList,{
			color:"red",
			weight: 2
        });
        
		polyline.addTo(map);
		//Check whether the polyline should be inside the feature group or not
		if(isInFeatureGroup){
			polylineGroup.push(polyline);
		}
	}
	if(isInFeatureGroup){
		FEATURE_GROUP = new L.featureGroup(polylineGroup);	
	}
}

function initMap(mapName){
	if(MAP !== null){
		MAP.remove();
		MAP = null;
	}
    //Initialize the map
	//The init center lat and long is not important, as the position table will have data
	MAP = L.map(mapName).setView([5.3,-3.9], 14);
    L.tileLayer('../map_tiles/OSMPublicTransport/{z}/{x}/{y}.png', {maxZoom: 16,minZoom:1}).addTo(MAP);
}

function updateMapMarker(latitude , longitude, isCenter){
    //Check if there is an existing marker on the map or not
	//Map marker is a global variable
	if(MAP_MARKER !== null){
		var latlonArray = [];
		latlonArray.push([MAP_MARKER.getLatLng().lat,MAP_MARKER.getLatLng().lng]);
		latlonArray.push([parseFloat(latitude), parseFloat(longitude)]);
        drawPolylineOnMap(latlonArray, MAP, false);
		//Just update its lat and long if the marker exists
		MAP_MARKER.setLatLng([latitude,longitude]).update();
		
	}else{
		//If the marker does not exist, create the marker with icon and add it to map
		var icon = L.icon({
			iconUrl: '../img/vessel.png',
			iconSize: [34, 22] // size of the icon
		});

		MAP_MARKER = new  L.marker([latitude, longitude], { icon: icon });
		MAP_MARKER.addTo(MAP);

	}

	if(isCenter){
		//Center the map view to the marker
		MAP.setView(MAP_MARKER.getLatLng(),15);
	}	

}
