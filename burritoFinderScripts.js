/**
 * Created By: Adrienne Cabouet
 * Date: 7/9/13
 * Time: 2:19 PM
 */
var ourCoords = {
    latitude: 45.5047947,
    longitude: -122.6534852
};

var map;

var watchID = null;

var options = {enableHighAccuracy: true, timeout: 100, maximumAge: 0};

var prevCoords = null;

var geocoder;

var currentPosition;

var directionsService;

var directionsDisplay;

var km;


window.onload = getMyLocation;

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            displayLocation,
            displayError,
            options);

        var watchButton = document.getElementById("watch");
        watchButton.onclick = watchLocation;
        var clearWatchButton = document.getElementById("clearWatch");
        clearWatchButton.onclick = clearWatch;
        var directionsButton = document.getElementById("getDirections");
        directionsButton.onclick = getDirections;
        var convertButton = document.getElementById("convert");
        convertButton.onclick = convert;


    } else {
        alert("Oops, your browser doesn't support geo-location.");
    }
}

function displayLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    currentPosition = new google.maps.LatLng(latitude, longitude);
    directionsService = new google.maps.DirectionsService();


    var div = document.getElementById("location");
    div.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;
    div.innerHTML += "<p>" + "Within " + position.coords.accuracy + " meters accuracy." + "</p>";
    div.innerHTML += "Found in " + options.timeout + " milliseconds.";

    km = computeDistance(position.coords, ourCoords);
    var miles = Math.floor(km * 0.6214);
    var distance = document.getElementById("distance");

    if (miles > 1) {
        distance.innerHTML = "You're " + miles + " miles from delicious burritos.";
    } else {
        distance.style.display = "none";
    }

    if (map == null) {
        showMap(position.coords);
        prevCoords = position.coords;
    } else {
        var meters = computeDistance(position.coords, prevCoords) * 1000;
        if (meters > 20) {
            scrollMapToPosition(position.coords);
            prevCoords = position.coords;
        }

    }
}

function displayError(error) {
    var errorTypes = {
        0: "Unknown error",
        1: "Permission denied by user",
        2: "Position is not available",
        3: "Request time out"
    };
    var errorMessage = errorTypes[error.code];
    if (error.code == 0 || error.code == 2) {
        errorMessage = errorMessage + " " + error.message;
    }
    var div = document.getElementById("location");
    div.innerHTML = errorMessage;
    options.timeout += 100;
    navigator.geolocation.getCurrentPosition(
        displayLocation,
        displayError,
        options);
    div.innerHTML += " . . . checking again with timeout=" + options.timeout;
}

function computeDistance(startCoords, destCoords) {
    var startLatRads = degreesToRadians(startCoords.latitude);
    var startLongRads = degreesToRadians(startCoords.longitude);
    var destLatRads = degreesToRadians(destCoords.latitude);
    var destLongRads = degreesToRadians(destCoords.longitude);

    var Radius = 6371; //radius of the Earth in km
    var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
                    Math.cos(startLatRads) * Math.cos(destLatRads) *
                    Math.cos(startLongRads - destLongRads)) * Radius;
    return distance;
}

function degreesToRadians(degrees) {
   var radians = (degrees * Math.PI)/180;
   return radians;
}

function showMap(coords) {
    var googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);

    var mapOptions = {
        zoom: 15,
        center: googleLatAndLong,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapDiv = document.getElementById("map");
    map = new google.maps.Map(mapDiv, mapOptions);

    var title ="Your Location";
    var content = "You are here: " + coords.latitude + ", " + coords.longitude;
    addMarker(map, googleLatAndLong, title, content);
}

function addMarker(map, latlong, title, content) {
    var markerOptions = {
        position: latlong,
        map: map,
        title: title,
        clickable: true
    };
    var marker = new google.maps.Marker(markerOptions);

    var infoWindowOptions = {
        content: content,
        position: latlong
    };
    var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

    google.maps.event.addListener(marker,"click", function() {
        infoWindow.open(map);
    });
}

function watchLocation() {
    watchID = navigator.geolocation.watchPosition(displayLocation,
                                                   displayError,
                                                   options);
}

function clearWatch() {
    if(watchID) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
}

function scrollMapToPosition(coords) {
    var latitude = coords.latitude;
    var longitude = coords.longitude;
    var latlong = new google.maps.LatLng(latitude, longitude);

    map.panTo(latlong);

    addMarker(map, latlong, "Your new location", "You moved to: " + latitude + ", " + longitude);
}

function convert() {
    geocoder = new google.maps.Geocoder;
    geocoder.geocode({"latLng" : currentPosition}, function(results, status){
        var div = document.getElementById("location");
        div.innerHTML = "You are at " + (results[0].formatted_address);
    });
}

function getDirections() {
    var burritos = new google.maps.LatLng(45.5047947, -122.6534852);

    var request = {
        origin: currentPosition,
        destination: burritos,
        travelMode: google.maps.TravelMode.BICYCLING
    };

    var directionsPanel = document.createElement("div");
    directionsPanel.setAttribute("id", "directionsPanel");

    var oldDirectionsPanel = document.getElementById("directionsPanel");
    var body = document.getElementsByTagName("body")[0];

    if (oldDirectionsPanel == null) {
        body.appendChild(directionsPanel);
    } else {
        body.replaceChild(directionsPanel, oldDirectionsPanel);
    }

    if (km > 0) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setPanel(directionsPanel);
        directionsDisplay.setMap(map);
        directionsService.route(request, function(response, status) {
            if(status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });}
}



