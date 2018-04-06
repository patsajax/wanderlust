$(document).ready(function() {
    $("#vmap").vectorMap({ 
        map: 'world_en',
        enableZoom: false,
        onRegionClick: function(event, code, region) {
            console.log(region);
            countryCode = code;
            $.ajax({
                url: "https://secure.geonames.org/countryInfoJSON",
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
                
                var north = response.geonames[0].north.toFixed(1);
                var south = response.geonames[0].south.toFixed(1);
                var east = response.geonames[0].east.toFixed(1);
                var west = response.geonames[0].west.toFixed(1);
                
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
var selectedCity = "";

function showMapView() {
    $("#map-view").show();

    $("#cities-view").hide();

    $('#vmap').vectorMap('set', 'colors', {[countryCode]: '#f4f3f0'});
}

function findCities(north, south, east, west) {
    $.ajax({
        url: "https://secure.geonames.org/citiesJSON",
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
    $("#country-flag").attr('src', "https://flagpedia.net/data/flags/normal/" + countryCode + ".png");
}

function showCitiesView() {
    $("#cities-view").show();
    $("#english-welcome").show();

    $("#map-view").hide();
    $("#information-view").hide();

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

    for (var i = 0; i < cities.length; i++) {
        $("#city-" + i).text(cities[i].name);
    }
}

$("#cities-back-button").on("click", function() {
    showMapView();
})

function showInformationView() {
    $("#information-view").show();

    $("#cities-view").hide();
}

$(".city").on("click", function(){
    showInformationView();

    selectedCity = cities[$(this).attr("data-city")];
    var selectedCityName = selectedCity.name;

    $("#selected-city").text(selectedCityName);
    $("#country-name").text(countryName);

    var lat1 = selectedCity.lat;
    var lng1 = selectedCity.lng;
    var lat2 = lat1 + 0.02;
    var lng2 = lng1 + 0.02;
    var coordinates = lat1 + "," + lng1 + "," + lat2 + "," + lng2;

//We can put anything we like in the parameters: &categories = eating/anything to replace poi

    $.ajax({
        url: "https://api.sygictravelapi.com/1.0/en/places/list?&levels=poi&limit=3",
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

    $.ajax({
        url: "https://openexchangerates.org/api/latest.json",
        data: {
            app_id: "ff16ac4b98544573ad72e111ebeaaab0",
            base: "USD"
        },
        method: "GET"
    }).then(function(response) {
        var convertedCurrency = response.rates[countryCurrency].toFixed(2);
        $("#currency-conversion").html("1 USD <i class='material-icons'>compare_arrows</i> " + convertedCurrency + " " + countryCurrency);
    })

    translatePhrases();
})

function translatePhrases() {
    for (let i = 0; i < helpfulPhrases.length; i++) {
        $.ajax({
            url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
            data: {
                key: "trnsl.1.1.20180330T194416Z.40eb4150fb68a578.188f9ff63bebe1f224ee9bcc9e9567efed0a287f",
                lang: "en-" + countryLanguage,
                text: helpfulPhrases[i]
            },
            method: "GET"
        }).then(function(response) {
            $("#phrase-" + i).text(response.text[0]);
        })
    }
}

$("#information-back-button").on("click", function() {
    showCitiesView();
})