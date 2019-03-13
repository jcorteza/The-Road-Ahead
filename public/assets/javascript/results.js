// global variable declaration for API specific data
let map;
let googleLatLng;
let directionsRequest;
let directionsResults;
let directionsService;
let directionsDisplay;
let hotels = [];

// set variables from session storage
addressInput = sessionStorage.getItem("addressInput");
radiusMeters = sessionStorage.getItem("radiusMeters");
entertainment = sessionStorage.getItem("entertainment");

$(document).ready(function() {
    $('.carousel').carousel();
    $.ajax({
        url: "/request",
        method: "POST",
        data: {
            address: addressInput
        },
        error: function(response) {
            console.log(`Error: ${JSON.stringify(response)}`);
        },
        success: function(response) {
            addLat = response.geometry.location.lat;
            addLng = response.geometry.location.lng;
            var locdata = [addLat, addLng];
            localStorage.setItem("locdata", JSON.stringify(locdata));
            initMap();
        }
    });
});

// start of google maps api functions
// initMap sets up the map's display
function initMap() {
    // latitude and longitude converted to a google map coordinate
    googleLatLng = new google.maps.LatLng(addLat, addLng);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map"), {
        center: googleLatLng,
        zoom: 12,
        fullscreenControl: false,
        gestureHandling: "cooperative",
        noClear: true
    });
    // set map marker for the starting destination
    const marker = new google.maps.Marker({
        position: googleLatLng, 
        map: map
    });
    // nearbySearch request object for places data
    const request = {
        location: googleLatLng,
        radius: radiusMeters,
        keyword: [entertainment],
        type: entertainment
    }
    // create new Google places object for the nearbySearch
    const placesInfo = new google.maps.places.PlacesService(map);
    placesInfo.nearbySearch(request, callback);
    directionsDisplay.setMap(map);
    // initialize google directionsService and request data
}

// callback function for places info request
function callback(result, status) {
    const googleStatus = google.maps.places.PlacesServiceStatus;
    if (status === googleStatus.OK) {
        // cycle through 3 of the google place results
        for (i = 0; i < 3; i++) {
            // store the place id in id variable for use in getPlaceDetails funciton
            const id = result[i].place_id;
            getPlaceDetails(id, `#result${i}`);
        }
    }
    else if (status === googleStatus.ERROR) {
        console.log("There was a problem contacting the Google servers.");
    }
    else if (status === googleStatus.INVALID_REQUEST) {
        console.log("This request was invalid.");
    }
    else if (status === googleStatus.OVER_QUERY_LIMIT) {
        console.log("The webpage has gone over its request quota.");
    }
    else if (status === googleStatus.NOT_FOUND) {
        console.log("The referenced location was not found in the Places database.");
    }
    else if (status === googleStatus.REQUEST_DENIED) {
        console.log("The webpage is not allowed to use the PlacesService.");
    }
    else if (status === googleStatus.UNKNOWN_ERROR) {
        console.log("The PlacesService request could not be processed due to a server error. The request may succeed if you try again.");
    }
    else if (status === googleStatus.ZERO_RESULTS) {
        console.log("No result was found for this request.");
    }
}
// function to get place specific details like name, place id, etc.
function getPlaceDetails(id, card) {
    // console.log("Inside getPlaceDetails function");
    // request object to be passed through places getDetails method
    request = {
        placeId: id,
        fields: ["name", "place_id", "formatted_address", "photo", "url"]
    }
    // create a new places object specific for places details
    const placesInfo = new google.maps.places.PlacesService(map);
    placesInfo.getDetails(request, function(place, status) {
        // console.log("inside callback function for getPlaceDetails");
        const googleStatus = google.maps.places.PlacesServiceStatus;
        if (status === googleStatus.OK) {
            // modify the results.html results cards based on the places details data
            $(card).attr("value", place.formatted_address)
            let resultName = place.name;
            if(place.photos) {
                let imgURL = place.photos[3].getUrl();
                $(card + " img").attr("src", imgURL);
            }
            else {
                $(card + " img").attr("alt", "No image available of " + resultName);
            }
            $(card + " .card-title").text(resultName);
            $(card + " .card-title").attr("class", "resultsTitle");
        }
        else if (status === googleStatus.ERROR) {
            console.log("There was a problem contacting the Google servers.");
        }
        else if (status === googleStatus.INVALID_REQUEST) {
            console.log("This request was invalid.");
        }
        else if (status === googleStatus.OVER_QUERY_LIMIT) {
            console.log("The webpage has gone over its request quota.");
        }
        else if (status === googleStatus.NOT_FOUND) {
            console.log("The referenced location was not found in the Places database.");
        }
        else if (status === googleStatus.REQUEST_DENIED) {
            console.log("The webpage is not allowed to use the PlacesService.");
        }
        else if (status === googleStatus.UNKNOWN_ERROR) {
            console.log("The PlacesService request could not be processed due to a server error. The request may succeed if you try again.");
        }
        else if (status === googleStatus.ZERO_RESULTS) {
            console.log("No result was found for this request.");
        }
    });
}
// when the card button is clicked run the get directions function, passing through the destination variable from the card value attribute
$(".btn-floating").on("click", function() {
    const destination = $(this).parent().parent()[0].attributes[2].value;
    getDirections(destination);
});

// getDirections function maps out the path from the user's start location to one of the potential places for their trip
function getDirections(destination) {
    // create a request object using the user's start location and target destination
    const request = {
        origin: googleLatLng,
        destination: destination,
        travelMode: "DRIVING",
        // waypoints: DirectionsWaypoint,
        // optimizeWaypoints: false,
        provideRouteAlternatives: false
    }
    directionsService.route(request, function(result, status) {
        if(status === "OK"){
            // display directions results on map
            directionsDisplay.setDirections(result);
        }
        else if(status === "NOT_FOUND"){
            console.log("At least one of the locations specified in the request's origin, destination, or waypoints could not be geocoded.");
        }
        else if(status === "ZERO_RESULTS"){
            console.log("No route could be found between the origin and destination.");
        }
        else if(status === "MAX_WAYPOINTS_EXCEEDED"){
            console.log("Too many DirectionsWaypoint fields were provided in the DirectionsRequest.");
        }
        else if(status === "MAX_ROUTE_LENGTH_EXCEEDED"){
            console.log("Requested route is too long and cannot be processed. This error occurs when more complex directions are returned. Try reducing the number of waypoints, turns, or instructions.");
        }
        else if(status === "INVALID_REQUEST"){
            console.log("The provided DirectionsRequest was invalid. The most common causes of this error code are requests that are missing either an origin or destination, or a transit request that includes waypoints.");
        }
        else if(status === "OVER_QUERY_LIMIT"){
            console.log("Webpage has sent too many requests within the allowed time period.");
        }
        else if(status === "REQUEST_DENIED"){
            console.log("The webpage is not allowed to use the directions service.");
        }
        else if(status === "UNKNOWN_ERROR"){
            console.log("Directions request could not be processed due to a server error. The request may succeed if you try again.");
        }
    });
}