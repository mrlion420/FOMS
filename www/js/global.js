$(document).ready(function(){
	loadSideMenu();
});

// GLOBAL VARIABLES
const WEBSERVICEHOST = "http://122.11.177.14:1703/FOMSWebService.svc/"; // For web service
// const WEBSERVICEHOST = "http://localhost:53777/FOMSWebService.svc/";
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
	"FleetDashboard.html",
	"VesselDashboard.html",
	"fuelcons.html",
	"",
	"AnalogReading.html"
];

var LOGINMENU = ["itemUserLogin", "itemEngineerLogin", "itemUserGuide"];
var PAGELOAD = true;
var INTERVAL_ARRAY = [];
// Feature group that contains all the polylines
var FEATURE_GROUP = null;
// Map object 
var MAP = null;
// Map marker object
var MAP_MARKER = null;
var INFO_WINDOW = new google.maps.InfoWindow();
// Timezone 
var TIMEZONE = 8;
var USERID = 53;
var COMPANYID = 0;
var FLEETID = 0;
var VESSELID = 0;
var TEMP_VESSELID = 0; // Holder for drop down changes 
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
	if(getCurrentPage() === "Login.html"){
		$("#sideMenu").load("/menu/LoginMenu.html" , function(){
			loginMenuClick();
		});
	}else{
		$("#sideMenu").load("/menu/MainMenu.html" , function(){
			displaySelectedTab();
			sideMenuClick();
		});
	}
	
}

function loginMenuClick(){
	$("#sideMenu .wrapper").on('click', 'div', function(){
		var divId = this.id;
		for(var i = 0; i < LOGINMENU.length; i++){
			if(divId === LOGINMENU[i]){
				$("#" + LOGINMENU[i]).addClass("selected");
			}else{
				$("#" + LOGINMENU[i]).removeClass("selected");
			}
		}
		$("#" + divId + "Container").show();
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

function removeSpace(str){
	str = str.replace(/\s/g, '');
	return str;
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

function setStartEndMarkerOnPopupMapLeaflet(latlonArray, map){
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

function setStartEndMarkerOnPopupMap(latlonArray, map){
	var startLat = latlonArray[0].Latitude;
	var startLon = latlonArray[0].Longitude;
	var latLng = new google.maps.LatLng(startLat, startLon);

	var startIcon = {
        url: '../img/start_vessel.png'
	};
	
	var startMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: startIcon
	});
	
	var endIcon = {
		url: '../img/vessel.png'
	};		

	var endLat = latlonArray[latlonArray.length - 1].Latitude;
	var endLon = latlonArray[latlonArray.length - 1].Longitude;
	latLng = new google.maps.LatLng(endLat, endLon);
	var endMarker = new google.maps.Marker({
		position: latLng,
        map: map,        
        icon: endIcon
	});
}

function drawPolylineOnMapLeaflet(latlonArray , map , isInFeatureGroup){
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

function drawPolylineOnMap(latlonArray, map , isInFeatureGroup){
	var polyLine = new google.maps.Polyline({
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	var bounds = new google.maps.LatLngBounds();
	polyLine.setMap(map);
	for(var i=0; i < latlonArray.length - 1; i++){
		var latLng = new google.maps.LatLng(latlonArray[i][0], latlonArray[i][1]);
		var polyLineArray = polyLine.getPath();
		polyLineArray.push(latLng);
		bounds.extend(latLng);
	}
	map.fitBounds(bounds);
}

function initMap(mapName){
	if(MAP !== null){
		//MAP.remove();
		MAP = null;
	}
    //Initialize the map
	//The init center lat and long is not important, as the position table will have data
	// MAP = L.map(mapName).setView([5.3,-3.9], 14);
	// L.tileLayer('../map_tiles/OSMPublicTransport/{z}/{x}/{y}.png', {maxZoom: 16,minZoom:1}).addTo(MAP);
	var myOptions = {
        zoom: 1,
        center: new google.maps.LatLng(0, 0),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        maxZoom: 19
	};
	
    MAP = new google.maps.Map(document.getElementById(mapName),
        myOptions);
}

function updateMapMarkerLeaflet(latitude , longitude, isCenter){
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

function insertMapMarkersLeaflet(data, map){
	var icon = L.icon({
		iconUrl: '../img/start_vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	for(var i = 0; i < data.length; i++){
		var startLat = data[i].Latitude;
		var startLon = data[i].Longitude;
		var vesselName = data[i].VesselName;
		
		var mapMarker = new  L.marker([startLat, startLon], { icon: icon });
		mapMarker.addTo(map);
		var popupText = "<b>" + vesselName + "</b>";
		mapMarker.bindPopup(popupText);
	}
}

function insertMapMarkers(data, map){
	var bounds = new google.maps.LatLngBounds();
	var icon = {
		url: '../img/vessel.png'
	};	

	for(var i = 0; i < data.length; i++){
		var lat = parseFloat(data[i].Latitude);
		var lon = parseFloat(data[i].Longitude);
		var vesselName = data[i].VesselName;
		
		var latLng = new google.maps.LatLng(lat, lon);

		var popupText = "<b>" + vesselName + "</b>";
		createMarker(latLng, map, popupText, icon);
		
		bounds.extend(latLng);
	}
	map.fitBounds(bounds);
}

function createMarker(latlon, map, iwContent, icon) {
	var marker = new google.maps.Marker({
		position: latlon,
		map: map,
		icon : icon
	});

	google.maps.event.addListener(marker, 'click', function () {
		INFO_WINDOW.setContent(iwContent);
		INFO_WINDOW.open(map, marker);
	});

	google.maps.event.addListener(marker, 'mouseover', function () {
		INFO_WINDOW.setContent(iwContent);
		INFO_WINDOW.open(map, marker);
	});

	google.maps.event.addListener(marker, 'mouseout', function () {
		INFO_WINDOW.close();
	});
}

var target = document.head;
var observer = new MutationObserver(function(mutations) {
    for (var i = 0; mutations[i]; ++i) { // notify when script to hack is added in HTML head
        if (mutations[i].addedNodes[0].nodeName == "SCRIPT" && mutations[i].addedNodes[0].src.match(/\/AuthenticationService.Authenticate?/g)) {
            var str = mutations[i].addedNodes[0].src.match(/[?&]callback=.*[&$]/g);
            if (str) {
                if (str[0][str[0].length - 1] == '&') {
                    str = str[0].substring(10, str[0].length - 1);
                } else {
                    str = str[0].substring(10);
                }
                var split = str.split(".");
                var object = split[0];
                var method = split[1];
                window[object][method] = null; // remove censorship message function _xdc_._jmzdv6 (AJAX callback name "_jmzdv6" differs depending on URL)
                //window[object] = {}; // when we removed the complete object _xdc_, Google Maps tiles did not load when we moved the map with the mouse (no problem with OpenStreetMap)
            }
            observer.disconnect();
        }
    }
});
var config = { attributes: true, childList: true, characterData: true }
observer.observe(target, config);
