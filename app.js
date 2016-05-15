//Global variables
var map, userPosition, infoWindow, service;
var searched = false;
var LAT = 38.9072;
var LNG = -77.0369;

//Hard-Coded Destinations
var defaultPlaces = [{
    "id": "national-gallery-of-art-washington",
    "name": "National Gallery of Art",
    "location": {
        "latitude": 38.8913416579172,
        "longitude": -77.0198351875512
    }
}, {
    "id": "hirshhorn-museum-and-sculpture-garden-washington-2",
    "name": "Hirshhorn Museum & Sculpture Garden",
    "location": {
        "latitude": 38.8875699,
        "longitude": -77.02191
    }
}, {
    "id": "bloombars-washington",
    "name": "BloomBars",
    "location": {
        "latitude": 38.930202,
        "longitude": -77.028114
    }
}, {
    "id": "freer-gallery-of-art-and-arthur-m-sackler-gallery-washington",
    "name": "Freer Gallery of Art and Arthur M Sackler Gallery",
    "location": {
        "latitude": 38.8875252753496,
        "longitude": -77.0265506207943
    }
}, {
    "id": "the-fridge-washington",
    "name": "The Fridge",
    "location": {
        "latitude": 38.88213,
        "longitude": -76.994232
    }
}, {
    "id": "national-gallery-of-art-sculpture-garden-washington-2",
    "name": "National Gallery of Art Sculpture Garden",
    "location": {
        "latitude": 38.8912975692515,
        "longitude": -77.022959356414
    }
}, {
    "id": "toro-mata-washington",
    "name": "Toro Mata",
    "location": {
        "latitude": 38.92099,
        "longitude": -77.04238
    }
}, {
    "id": "the-smithsonian-institution-washington",
    "name": "The Smithsonian Institution",
    "location": {
        "latitude": 38.8889236,
        "longitude": -77.0261612
    }
}, {
    "id": "artists-proof-washington-2",
    "name": "Artist's Proof",
    "location": {
        "latitude": 38.910091,
        "longitude": -77.064407
    }
}, {
    "id": "the-phillips-collection-washington-3",
    "name": "The Phillips Collection",
    "location": {
        "latitude": 38.911477119043,
        "longitude": -77.0468060633715
    }
}];

//KO Simple View Model
var viewModel = {
    filter: ko.observable(""),
    status: ko.observable(""),
    places: ko.observableArray([])
};

//KO Subscription that watches the filter observable and filters places from list
viewModel.filter.subscribe(function(newValue) {
    filterPlaces(newValue);
});

//Function that removes places from list and map base on filter entered
function filterPlaces(value) {
    var regex = new RegExp(value, "i");
    viewModel.places().forEach(function(place) {
        if (place.name.search(regex) == -1) {
            place.show(false);
            place.marker.setVisible(false);
        } else {
            place.show(true);
            place.marker.setVisible(true);
        }
    });
}

//Applying the bindings to the view model
ko.applyBindings(viewModel);

//Init Map function
var initMap = function() {
    console.log("Starting initMap()...")
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

    function geoSuccess(position) {
        userPosition = position;
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: userPosition.coords.latitude,
                lng: userPosition.coords.longitude
            },
            zoom: 12,
            mapTypeControl: false
        });
        finishInit();
    };

    function geoError(error) {
        console.log("Geolocation Error: " + error.code);
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: LAT,
                lng: LNG
            },
            zoom: 12,
            mapTypeControl: false
        });
        finishInit();
    };

    function finishInit() {
        console.log("finishInit called...");
        infoWindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        placeMarkers();
    };


}

function placeMarkers(){
    defaultPlaces.forEach(function(place){
        addMarker(place);
    })
};

function addMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: {
            lng: place.location.longitude,
            lat: place.location.latitude
        },
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    place.marker = marker;
    place.show = ko.observable(true);
    viewModel.places.push(place);

    google.maps.event.addListener(marker, 'click', function() {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 700);
        infoWindow.setContent(place.name);
        infoWindow.open(map, marker);
    });
}

function getYelpPlaces() {

    var YELP_KEY = "pV7R7vzUXJEFfl3Dj4retQ",
        YELP_TOKEN = "VDFoUxGRIq2274OdKt8U-wwvpgnkKtrL",
        YELP_KEY_SECRET = "t4CQ3YyzkgP26-lDGp1pVoLOFks",
        YELP_TOKEN_SECRET = "SB5H01fW3LCNi3qyO7uaJ59DK9U";

    var yelp_url = 'https://api.yelp.com/v2/search';

    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    var parameters = {
        oauth_consumer_key: YELP_KEY,
        oauth_token: YELP_TOKEN,
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb',
        term: 'art',
        category_filter: 'galleries',
        location: 'Washington, DC',
        cll: LAT + ',' + LNG
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
    parameters.oauth_signature = encodedSignature;

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            console.log("Success: " + results);
            console.log(results);
            for (var i = 0; i < 10; i++) {
                addMarker(results.businesses[i]);
            }
        },
        error: function(result) {
            console.log("Error: " + result);
        }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}



function toggleMenu() {
    var logo = document.getElementById("logo");
    var menu = document.getElementById("menu");
    if (logo.className === "logo logo-open") {
        logo.className = "logo logo-close";
        menu.className = "menu-close";
    } else {
        logo.className = "logo logo-open";
        menu.className = "menu-open";
    }
}

window.onerror = function(errorMsg, url, lineNumber) {
    document.body.innerHTML = '<div class="errorPage"><div class="errorMessage">'
    + 'Uh oh! Something went wrong. Try refreshing the page.<br>'
    + errorMsg
    + '</div></div>';
    return true;
}
