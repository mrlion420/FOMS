$(document).ready(function () {
	loadSideMenu();
	logoutBtnClickHandler();
});

// sessionStorage.setItem("engineUnit", "ℓ");
// sessionStorage.setItem("timezone", 8);
// sessionStorage.setItem("userId", 3);

// GLOBAL VARIABLES
const WEBSERVICEHOST = "http://122.11.177.14:1800/Webservice/FOMSWebService.svc/"; // For web service
// const WEBSERVICEHOST = "http://localhost:53777/FOMSWebService.svc/";
// const WEBSERVICEHOST = "http://localhost:8099/Webservice/FOMSWebService.svc/";

const MENU_ID = [
	"itemFleet",
	"itemVessel",
	"itemFuelCons",
	"itemLoading",
	"itemAnalog",
	"itemOtherSignal",
	"itemReports",
	"itemSettings"
];

const MENU_PAGE = [
	"FleetDashboard.html",
	"VesselDashboard.html",
	"fuelcons.html",
	"",
	"AnalogReading.html",
	"OtherSignal.html",
	"Report.html",
	""
];

var LOGINMENU = ["itemUserLogin", "itemEngineerLogin", "itemUserGuide"];
var PAGELOAD = true;
var INTERVAL_ARRAY = [];
// Map object 
var MAP = null;
// Map marker object
var MAP_MARKER = null;
var INFO_WINDOW = null;
// Timezone 
if(sessionStorage.getItem("timezone") !== undefined){
	var TIMEZONE = sessionStorage.getItem("timezone");
}

if(sessionStorage.getItem("userId") !== undefined){
	var USERID = sessionStorage.getItem("userId");
}
// var USERID = 3;
// var USERID = 38; 
var COMPANYID = 0;
var FLEETID = 0;
var VESSELID = 0;
var TEMP_VESSELID = 0; // Holder for drop down changes 

const DELIMITER = ";";
const TRUE = "True";
const FALSE = "False";

function setConstArrays() {
	if (sessionStorage.getItem("userId") !== undefined) {
		var TIMEZONE = sessionStorage.getItem("timezone");
		var USERID = sessionStorage.getItem("userId");

		var PARAMETER_USERID = { userId: USERID };
		var PARAMETER_TIMEZONE = { timezone: TIMEZONE };
		var PARAMETER_VESSELID = { vesselId: VESSELID };
		var PARAMETER_COMBINED = { vesselId: VESSELID, timezone: TIMEZONE };
	}
}

// To remove all the unnecessary paramters from the array that were added
function resetConstArrays() {
	var TIMEZONE = sessionStorage.getItem("timezone");
	var USERID = sessionStorage.getItem("userId");
	PARAMETER_USERID = { userId: USERID };
	PARAMETER_TIMEZONE = { timezone: TIMEZONE };
	PARAMETER_VESSELID = { vesselId: VESSELID };
	PARAMETER_COMBINED = { vesselId: VESSELID, timezone: TIMEZONE };
}

function ajaxPost(methodName, data) {
	var url = WEBSERVICEHOST + methodName;
	return $.ajax({
		type: "POST",
		url: url,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		data: JSON.stringify(data)
	});
}

function ajaxGet(methodName, data) {
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

function loadSideMenu() {
	if (getCurrentPage().toLowerCase() === "login.html") {
		$("#sideMenu").load("../menu/LoginMenu.html", function () {
			loginMenuClick();
		});
	} else {
		$("#sideMenu").load("../menu/MainMenu.html", function () {
			displaySelectedTab();
			sideMenuClick();
		});
	}

}

function loginMenuClick() {
	$("#sideMenu .wrapper").on('click', 'div', function () {
		var divId = this.id;
		for (var i = 0; i < LOGINMENU.length; i++) {
			if (divId === LOGINMENU[i]) {
				$("#" + LOGINMENU[i]).addClass("selected");
			} else {
				$("#" + LOGINMENU[i]).removeClass("selected");
			}
		}
		$("#" + divId + "Container").show();
	});
}

function displaySelectedTab() {
	for (var i = 0; i < MENU_ID.length; i++) {
		if (MENU_PAGE[i] === getCurrentPage()) {
			$("#" + MENU_ID[i]).addClass("selected");
		}
	}
}

function sideMenuClick() {
	$("#sideMenu .wrapper").on('click', 'div', function () {
		var menuId = MENU_ID.indexOf(this.id);
		redirectPageWithReturn("" + MENU_PAGE[menuId]);
	});
}

function getCurrentPage() {
	var currentUrl = window.location.href;
	var lastIndex = currentUrl.lastIndexOf("/");
	var currentPage = currentUrl.substring(lastIndex + 1);
	return currentPage;
}

function logoutBtnClickHandler() {
	$("#imgLogout").click(function () {
		redirectPageWithReturn("Login.html");
	});
}

function customAlert(title, message, redirect, redirectUrl) {
	if (redirect) {
		$("#dialog").dialog({
			width: 400,
			height: 250,
			modal: true,
			title: title,
			open: function () {
				$(this).html(message);
			},
			buttons: [
				{
					text: "Ok",
					click: function () {
						window.location.replace(redirectUrl);
						$(this).dialog("close");
					}
				}
			]
		});
	} else {
		$("#dialog").dialog({
			width: 400,
			height: 250,
			modal: true,
			title: title,
			open: function () {
				$(this).html(message);
			},
			buttons: [
				{
					text: "Ok",
					click: function () {
						$(this).dialog("close");
					}
				}
			]
		});
	}
}

function redirectPageWithoutReturn(url) {
	window.location.replace(url);
}

function redirectPageWithReturn(url) {
	window.location.href = url;
}

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function roundWithZero(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
}

function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function removeCommas(x) {
	x = x.replace(/\,/g, '');
	return x;
}

function clearIntervalArray() {
	$.each(INTERVAL_ARRAY, function (indexInArray, valueOfElement) {
		clearInterval(valueOfElement);
	});
}

function refreshPage() {
	location.reload();
}

function removeSpace(str) {
	str = str.replace(/\s/g, '');
	return str;
}

function getPosition(string, subString, index) {
	return string.split(subString, index).join(subString).length;
}

function paginationTable(maxTableRows) {
	var currentPage = parseInt($("#currentTablePage").text());
	var maxCurrentItem = maxTableRows * currentPage;
	var counter = 0;
	//Calculate the counter 
	if (currentPage !== 1) {
		counter = (maxTableRows * (currentPage - 1)) + 1;
	}
	var maxPage = parseInt($("#totalTablePage").text());

	// $("#" + tableName + "tbody tr").hide();
	for (var i = 0; i < maxPage * maxTableRows; i++) {
		$("#table-" + i).hide();
	}

	for (i = counter - 1; i < maxCurrentItem; i++) {
		$("#table-" + i).show();
	}
}

function tablePaginationClickHandler(maxTableRows) {
	$("#forwardPagination").click(function () {
		var maxPage = parseInt($("#totalTablePage").text());
		var currentPage = parseInt($("#currentTablePage").text());
		if (currentPage !== maxPage) {
			$("#currentTablePage").text(currentPage + 1);
		}
		paginationTable(maxTableRows);
	});

	$("#backPagination").click(function () {
		var currentPage = parseInt($("#currentTablePage").text());
		if (currentPage !== 1) {
			$("#currentTablePage").text(currentPage - 1);
		}
		paginationTable(maxTableRows);
	});
}

function dynamicTablePaginationClickHandler(maxTableRows, containerName) {
	$("#" + containerName).on("click", "#forwardPagination", function () {
		var maxPage = parseInt($("#totalTablePage").text());
		var currentPage = parseInt($("#currentTablePage").text());
		if (currentPage !== maxPage) {
			$("#currentTablePage").text(currentPage + 1);
		}
		paginationTable(maxTableRows);
	});

	$("#" + containerName).on("click", "#backPagination", function () {
		var currentPage = parseInt($("#currentTablePage").text());
		if (currentPage !== 1) {
			$("#currentTablePage").text(currentPage - 1);
		}
		paginationTable(maxTableRows);
	});
}

function setStartEndMarkerOnPopupMapLeaflet(latlonArray, map) {
	var startLat = latlonArray[0].Latitude;
	var startLon = latlonArray[0].Longitude;

	var icon = L.icon({
		iconUrl: '../img/start_vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	var startMapMarker = new L.marker([startLat, startLon], { icon: icon });
	startMapMarker.addTo(map);

	//Get the latest entry inside the array
	var endLat = latlonArray[latlonArray.length - 1].Latitude;
	var endLon = latlonArray[latlonArray.length - 1].Longitude;

	icon = L.icon({
		iconUrl: '../img/vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	endMapMarker = new L.marker([endLat, endLon], { icon: icon });
	endMapMarker.addTo(map);

}

function setStartEndMarkerOnPopupMap(latlonArray, map) {
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

function setStartEndMarkerOnPositionMap(latlonArray, map) {
	var startLat = latlonArray[0][0];
	var startLon = latlonArray[0][1];
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

	var endLat = latlonArray[latlonArray.length - 1][0];
	var endLon = latlonArray[latlonArray.length - 1][1];
	latLng = new google.maps.LatLng(endLat, endLon);
	var endMarker = new google.maps.Marker({
		position: latLng,
		map: map,
		icon: endIcon
	});
}

function drawPolylineOnMapLeaflet(latlonArray, map, isInFeatureGroup) {
	var polylineGroup = [];
	//  -1 the length of the array, since the drawing of polyline uses two index of the array
	//  First index will be the starting point and the second one will be the ending point
	for (var i = 0; i < latlonArray.length - 1; i++) {
		var startPointArray = latlonArray[i];
		var endPointArray = latlonArray[i + 1];
		var startPoint = new L.LatLng(startPointArray[0], startPointArray[1]);
		var endPoint = new L.LatLng(endPointArray[0], endPointArray[1]);

		var pointList = [startPoint, endPoint];
		var polyline = new L.polyline(pointList, {
			color: "red",
			weight: 2
		});

		polyline.addTo(map);
		//Check whether the polyline should be inside the feature group or not
		if (isInFeatureGroup) {
			polylineGroup.push(polyline);
		}
	}
	if (isInFeatureGroup) {
		FEATURE_GROUP = new L.featureGroup(polylineGroup);
	}
}

function drawPolylineOnMap(latlonArray, map) {
	var polyLine = new google.maps.Polyline({
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	var bounds = new google.maps.LatLngBounds();
	polyLine.setMap(map);
	for (var i = 0; i < latlonArray.length - 1; i++) {
		var latLng = new google.maps.LatLng(latlonArray[i][0], latlonArray[i][1]);
		var polyLineArray = polyLine.getPath();
		polyLineArray.push(latLng);
		bounds.extend(latLng);
	}
	map.fitBounds(bounds);
}

function initMap(mapName) {
	if (MAP !== null) {
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
	INFO_WINDOW = new google.maps.InfoWindow();
}

function updateMapMarkerLeaflet(latitude, longitude, isCenter) {
	//Check if there is an existing marker on the map or not
	//Map marker is a global variable
	if (MAP_MARKER !== null) {
		var latlonArray = [];
		latlonArray.push([MAP_MARKER.getLatLng().lat, MAP_MARKER.getLatLng().lng]);
		latlonArray.push([parseFloat(latitude), parseFloat(longitude)]);
		drawPolylineOnMap(latlonArray, MAP, false);
		//Just update its lat and long if the marker exists
		MAP_MARKER.setLatLng([latitude, longitude]).update();

	} else {
		//If the marker does not exist, create the marker with icon and add it to map
		var icon = L.icon({
			iconUrl: '../img/vessel.png',
			iconSize: [34, 22] // size of the icon
		});

		MAP_MARKER = new L.marker([latitude, longitude], { icon: icon });
		MAP_MARKER.addTo(MAP);

	}

	if (isCenter) {
		//Center the map view to the marker
		MAP.setView(MAP_MARKER.getLatLng(), 15);
	}

}

function insertMapMarkersLeaflet(data, map) {
	var icon = L.icon({
		iconUrl: '../img/start_vessel.png',
		iconSize: [34, 22] // size of the icon
	});

	for (var i = 0; i < data.length; i++) {
		var startLat = data[i].Latitude;
		var startLon = data[i].Longitude;
		var vesselName = data[i].VesselName;

		var mapMarker = new L.marker([startLat, startLon], { icon: icon });
		mapMarker.addTo(map);
		var popupText = "<b>" + vesselName + "</b>";
		mapMarker.bindPopup(popupText);
	}
}

function insertMapMarkers(data, map) {
	var bounds = new google.maps.LatLngBounds();
	var icon = {
		url: '../img/vessel.png'
	};

	for (var i = 0; i < data.length; i++) {
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

function insertMapMarkersWithEvents(data, map) {
	var bounds = new google.maps.LatLngBounds();
	$.each(data, function (key, value) {
		var icon = setDirectionIcon(value);
		var lat = parseFloat(value.Latitude);
		var lon = parseFloat(value.Longitude);
		let sog = parseFloat(value.Sog);
		let cog = parseFloat(value.Cog);
		let wgsLat = value.Wgs84Lat;
		let wgsLon = value.Wgs84Lon;
		let positionDatetime = value.PositionDatetime;
		let eventDetails = "";

		if (value.EventDesc !== "") {
			let splitString = value.EventDesc.split("|");
			for (let j = 0; j < splitString.length; j++) {
				let lastIndex = getPosition(splitString[j], "~", 3);
				let singleEvent = splitString[j].substring(lastIndex + 1);
				eventDetails += "<p>" + singleEvent + "</p>";
			}
		}

		var latLng = new google.maps.LatLng(lat, lon);

		let popupText = "<div class='map-popup'>";
		popupText += "<div><p>Position Datetime : </p><p>" + positionDatetime + "</p></div>";
		popupText += "<div><p>Last Position : </p><p>" + wgsLat + " " + wgsLon + "</p></div>";
		popupText += "<div><p>SOG / COG : </p><p>" + sog + " Knots " + cog + " Deg" + "</p></div>";
		popupText += "<div><p>Event(s) : </p><div>" + eventDetails + "</div></div>";
		popupText += "</div>";
		createMarker(latLng, map, popupText, icon);

		bounds.extend(latLng);
	});

	map.fitBounds(bounds);
}

function setDirectionIcon(item) {
	let iconAddress = "";
	if (item !== null) {
		let cog = item.Cog;

		if (item.EventDesc === '') {
			if (cog > 337.5 || cog < 22.5) {
				iconAddress = "../img/N.png";
			} else if (cog >= 67.5 && cog < 112.5) {
				iconAddress = "../img/E.png";
			} else if (cog >= 157.5 && cog < 202.5) {
				iconAddress = "../img/S.png";
			} else if (cog >= 247.5 && cog < 292.5) {
				iconAddress = "../img/W.png";
			} else if (cog >= 22.5 && cog < 67.5) {
				iconAddress = "../img/NE.png";
			} else if (cog >= 112.5 && cog < 157.5) {
				iconAddress = "../img/SE.png";
			} else if (cog >= 202.5 && cog < 247.5) {
				iconAddress = "../img/SW.png";
			} else if (cog >= 292.5 && cog < 337.5) {
				iconAddress = "../img/NW.png";
			}
		} else {
			if (cog > 337.5 || cog < 22.5) {
				iconAddress = "../img/N_EVENT.png";
			} else if (cog >= 67.5 && cog < 112.5) {
				iconAddress = "../img/E_EVENT.png";
			} else if (cog >= 157.5 && cog < 202.5) {
				iconAddress = "../img/S_EVENT.png";
			} else if (cog >= 247.5 && cog < 292.5) {
				iconAddress = "../img/W_EVENT.png";
			} else if (cog >= 22.5 && cog < 67.5) {
				iconAddress = "../img/NE_EVENT.png";
			} else if (cog >= 112.5 && cog < 157.5) {
				iconAddress = "../img/SE_EVENT.png";
			} else if (cog >= 202.5 && cog < 247.5) {
				iconAddress = "../img/SW_EVENT.png";
			} else if (cog >= 292.5 && cog < 337.5) {
				iconAddress = "../img/NW_EVENT.png";
			}

		}
	}
	return iconAddress;
}

function createMarker(latlon, map, iwContent, icon) {
	var marker = new google.maps.Marker({
		position: latlon,
		map: map,
		icon: icon
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

// Set high chart thousand separator in global
Highcharts.setOptions({
	lang: {
		thousandsSep: ','
	}
});

// Google Map bypass
var target = document.head;
var observer = new MutationObserver(function (mutations) {
	for (var i = 0; mutations[i]; ++i) { // notify when script to hack is added in HTML head
		if (mutations[i].addedNodes[0].nodeName === "SCRIPT" && mutations[i].addedNodes[0].src.match(/\/AuthenticationService.Authenticate?/g)) {
			var str = mutations[i].addedNodes[0].src.match(/[?&]callback=.*[&$]/g);
			if (str) {
				if (str[0][str[0].length - 1] === '&') {
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
