// global variable declaration for API specific data
let map;
let googleLatLng;
let directionsRequest;
let directionsResults;
let hotels = [];

// set variables from session storage
addressInput = sessionStorage.getItem("addressInput");
radiusMeters = sessionStorage.getItem("radiusMeters");
entertainment = sessionStorage.getItem("entertainment");
const ipKey = "AIzaSyBlRT6EF4BPQobKI9CgS9TwqOUdLqiSWYg";
const httpKey = "AIzaSyCkWLplfERYd7MKirTiRwl9rhCzsPDVN8Q";

$(document).ready(function() {
    $('.carousel').carousel();
    /* start Google API */
    var googleURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressInput}&country=US&key=${ipKey}`;
    $.ajax({
        url: googleURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        addLat = response.results[0].geometry.location.lat;
        addLng = response.results[0].geometry.location.lng;
        var locdata = [addLat, addLng];
        localStorage.setItem("locdata", JSON.stringify(locdata));

        /* start travel API */
        //query for list of hotels
        var travelURL = `https://api.sandbox.amadeus.com/v1.2/hotels/search-circle?apikey=nG40G2MNyhpYFWNBKWFpW83hKIUnrkHO&latitude=${addLat}&longitude=${addLng}&radius=42&number_of_results=5&check_in=2018-12-15&check_out=2018-12-16`;
        $.ajax({
            url: travelURL,
            method: "GET"
        }).then(function(response){
            hotels = response.results;
            console.log("HOTELS:::");
            console.log(hotels);
            console.log(window.location);
            addHotelList();
        });
    /* Contintue Google Maps API */
    }).then(function() {
        initMap();
    });
});

// start of google maps api functions
// initMap sets up the map's display
function initMap() {
    // latitude and longitude converted to a google map coordinate
    googleLatLng = new google.maps.LatLng(addLat, addLng);
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
    // initialize google directionsService and request data
}

// callback function for places info request
function callback(result, status) {
    const googleStatus = google.maps.places.PlacesServiceStatus;
    if (status === googleStatus.OK) {
        console.log("The response contains a valid result.");
        console.log(result);
        // cycle through 3 of the google place results
        for (i = 0; i < 3; i++) {
            // store the place id in id variable for use in getPlaceDetails funciton
            const id = result[i].place_id;
            console.log(id);
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
            console.log("The response contains a valid result.");
            // modify the results.html results cards based on the places details data
            $(card).attr("value", place.place_id)
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
    // console.log(destination);
    // getDirections(destination);
    let directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${addressInput}&destination=place_id:${destination}&key=${ipKey}`
    console.log(directionsURL);
    $.ajax({
        url: directionsURL,
        method: "GET",
        dataType: "jsonp",
        crossDomain: true,
        contentType: "application/json",
        secure: true,
        mimeType: "application/json",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa(""));
        }
    }).then(function(response) {
        const gglStatus = JSON.parse(response.status);
        if(status !== "OK") {
            return console.log(`Status: ${gglStatus}`);
        }
        console.log(`Status: ${gglStatus}`);
        console.log(`Status: ${JSON.parse(response.routes)}`);
    });
});

//add list of hotels to page
function addHotelList(){
    for(var i = 0; i < hotels.length; i++){
        var hotel = hotels[i];
        var name = hotel.property_name;
        var addressline = hotel.address.line1;
        var city = hotel.address.city;
        var state = hotel.address.region;
        var rating = "No Rating found";
        if(!hotel.awards[0] === undefined){

            rating = hotel.awards[0].provider +": "+hotel.awards[0].rating;
        }
        //var tablerow = $("<tr>").append($("<td>")).text(hotel.property_name)
        //tablerow.append($("<td>")).text(addressline+" "+city+", "+state)
        //tablerow.append($("<td>")).text(rating);
        $("#hotel-list").append(`<tr class="hotel-table-row">
        <td>${name}</td>
        <td>${addressline} ${city}, ${state}</td>
        <td>${rating}</td>
        </td>`);
    }
}
// getDirections function maps out the path from the user's start location to one of the potential places for their trip
function getDirections(destination) {
    // create lace google place object using the desitination's place id
    const place = {
        placeId: destination
    }
    // create a request object using the user's start location and target destination
    const request = {
        origin: googleLatLng,
        destination: place,
        travelMode: "DRIVING",
        // waypoints: DirectionsWaypoint,
        // optimizeWaypoints: false,
        provideRouteAlternatives: false
    }
    directionsRequest.route(request, function(result, status) {
        if(status === "OK"){
            console.log("Route found.");
            // display directions results on map
            directionsResults.setDirections(result);
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