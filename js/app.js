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

var countryCode = "";
var countryLanguage = "";
var cities = [];
var helpfulPhrases = ["Hello"];

var findCities = function(north, south, east, west) {
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
    })
}

var translatePhrases = function() {
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