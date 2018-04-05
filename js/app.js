$(document).ready(function() {
    $("#vmap").vectorMap({ 
        map: 'world_en',
        enableZoom: false,
        onRegionClick: function(event, code, region) {
            countryCode = code;
            $.ajax({
                url: "http://api.geonames.org/countryInfoJSON?",
                data: {
                    username: "carladdg",
                    country: countryCode
                },
                method: "GET"
            }).then(function(response) {
                countryName = response.geonames[0].countryName;
                countryCurrency = response.geonames[0].currencyCode;

                var spokenLanguages = response.geonames[0].languages;
                countryLanguage = spokenLanguages.slice(0,2);
                
                var north = response.geonames[0].north.toFixed(2);
                var south = response.geonames[0].south.toFixed(2);
                var east = response.geonames[0].east.toFixed(2);
                var west = response.geonames[0].west.toFixed(2);
                
                findCities(north, south, east, west);
            })
        }
    });
});

// Country and city information global variables
var countryCode = "";
var countryName = "";
var countryCurrency = "";
var countryLanguage = "";
var cities = [];
var helpfulPhrases = ["Hello", "Please", "Thank you", "How much does this cost?", "Where is the bathroom?"];

$(document).on("click", "#test-btn", function(test){
    var lat1 = cities[0].lat;
    console.log(lat1);
    var lng1 = cities[0].lng;
    console.log(lng1);
    var lat2 = lat1 + 0.02;
    var lng2 = lng1 + 0.02;
    var coordinates = lat1 + "," + lng1 + "," + lat2 + "," + lng2;
    console.log(coordinates);
    var cityName = cities[0].name;
    console.log(cityName)

//We can put anything we like in the parameters: &categories = eating/anything to replace poi

    $.ajax({
        url: "https://api.sygictravelapi.com/1.0/en/places/list?&levels=poi&limit=10",
        data: {
            bounds:coordinates
        },
        headers: {
            'x-api-key': "1L2UnOUBpyaJMeyqcmHWs1oQU8ha9kgH5aG7ZYcr"
        },
        method: "GET"
    }).then(function(response) {
        console.log(response)
    })
})

function findCities(north, south, east, west) {
    $.ajax({
        url: "http://api.geonames.org/citiesJSON",
        data: {
            username: "carladdg",
            north: north,
            south: south,
            east: east,
            west: west,
            maxRows: 25
        },
        method: "GET"
    }).then(function(response) {
        console.log(response);
        cities = response.geonames.filter(function(city) {
            return city.countrycode === countryCode.toUpperCase();
        }).slice(0,3);
        console.log(cities);
        showCitiesView();
    })
    
    // Add Flags to Second Page
    $("#my-image").attr('src', "http://www.geonames.org/flags/x/" + countryCode + ".gif")
}

function showMapView() {
    $("#map-view").show();
    
    $("#cities-view").hide();

    $('#vmap').vectorMap('set', 'colors', {[countryCode]: '#f4f3f0'});
}

function showCitiesView() {
    $("#cities-view").show();
    $("#english-welcome").show();

    $("#map-view").hide();
    $("#information-view").hide();

    $("<button>").text(countryCode).appendTo("#cities-area").attr("id","test-btn");

    if (countryLanguage !== "en") {
        $("#english-country-name").text(countryName);
    } else {
        $("#english-welcome").hide();
    }
    
    $.ajax({
        url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
        data: {
            key: "trnsl.1.1.20180330T194416Z.40eb4150fb68a578.188f9ff63bebe1f224ee9bcc9e9567efed0a287f",
            lang: "en-" + countryLanguage,
            text: "Welcome to " + countryName
        },
        method: "GET"
    }).then(function(response) {
        console.log(response);
        $("#foreign-welcome").text(response.text);
    })
}

function translatePhrases() {
    for (var i = 0; i < helpfulPhrases.length; i++) {
        $.ajax({
            url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
            data: {
                key: "trnsl.1.1.20180330T194416Z.40eb4150fb68a578.188f9ff63bebe1f224ee9bcc9e9567efed0a287f",
                lang: "en-" + countryLanguage,
                text: helpfulPhrases[i]
            },
            method: "GET"
        }).then(function(response) {
            console.log(response);
        })
    }
}

$("#cities-back-button").on("click", function() {
    showMapView();
})
