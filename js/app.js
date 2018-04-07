var countryCode = "";
var countryName = "";
var countryCurrency = "";
var countryLanguage = "";
var cities = [];

var selectedCity = "";
var attractionInfo = ""
var helpfulPhrases = ["Hello", "Please", "Thank you", "How much does this cost?", "Where is the bathroom?"];
var charactersRemaining = 50;

$(document).ready(function() {
    $("#vmap").vectorMap({ 
        map: 'world_en',
        enableZoom: false,
        onRegionClick: function(event, code, region) {
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
        cities = response.geonames.filter(function(city) {
            return city.countrycode === countryCode.toUpperCase();
        }).slice(0,3);
        showCitiesView();
    })
}

function showCitiesView() {
    $("#cities-view").show();
    $("#foreign-welcome").show();

    $("#map-view").hide();
    $("#information-view").hide();

    displayFlag();
    displayCountryGreeting();
    displayCities();
}

function displayFlag() {
    $("#country-flag").attr('src', "https://flagpedia.net/data/flags/normal/" + countryCode + ".png");
}

function displayCountryGreeting() {
    if (countryLanguage !== "en") {
        $("#english-country-name").text(countryName);
        $.ajax({
            url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
            data: {
                key: "trnsl.1.1.20180330T194416Z.40eb4150fb68a578.188f9ff63bebe1f224ee9bcc9e9567efed0a287f",
                lang: "en-" + countryLanguage,
                text: "Welcome to " + countryName
            },
            method: "GET"
        }).then(function(response) {
            $("#english-country-name").text(countryName);
            $("#foreign-country-name").text(response.text);
        })
    } else {
        $("#english-country-name").text(countryName);
        $("#foreign-welcome").hide();
    }
}

function displayCities() {
    for (var i = 0; i < cities.length; i++) {
        $("#city-" + i).text(cities[i].name);
    }
}

$("#cities-back-button").on("click", function() {
    showMapView();
})

function showMapView() {
    $("#map-view").show();

    $("#cities-view").hide();

    $('#vmap').vectorMap('set', 'colors', {[countryCode]: '#f4f3f0'});
}

function showInformationView() {
    $("#information-view").show();

    $("#cities-view").hide();

    if (countryLanguage === "en") {
        $("#user-translation-area").hide()
    } else {
        $("#user-translation-area").show()
    }
}

$(".city").on("click", function(){
    showInformationView();
    
    selectedCity = cities[$(this).attr("data-city")];
    var selectedCityName = selectedCity.name;
    var lat1 = selectedCity.lat;
    var lng1 = selectedCity.lng;
    var lat2 = lat1 + 0.02;
    var lng2 = lng1 + 0.02;
    var coordinates = lat1 + "," + lng1 + "," + lat2 + "," + lng2;

    displayCityGreeting(selectedCityName);
    // findAttractions(coordinates);
    convertCurrency();
    translatePhrases();
})

function displayCityGreeting(selectedCityName) {
    $("#selected-city").text(selectedCityName);
    $("#country-name").text(countryName);
}

function findAttractions(coordinates) {
    $.ajax({
        url: "https://api.sygictravelapi.com/1.0/en/places/list?&levels=poi&limit=3",
        data: {
            bounds: coordinates
        },
        headers: {
            'x-api-key': "1L2UnOUBpyaJMeyqcmHWs1oQU8ha9kgH5aG7ZYcr"
        },
        method: "GET"
    }).then(function(response) {
        attractionInfo = response.data.places
        displayAttractions()
    })
}

function displayAttractions(){
    $("#attraction-0").empty();
    $("#attraction-1").empty();
    $("#attraction-2").empty();

    for (var i = 0;  i < 3; i++) {
        attractionName = $("<div>").text(attractionInfo[i].name).addClass("col s12");
        $("#attraction-"+i).append(attractionName);
    }

    for (var i = 0; i < 3; i++) {
        attractionImage = $("<img>").attr("src", attractionInfo[i].thumbnail_url).addClass("col s3");
        $("#attraction-"+i).append(attractionImage);
    }

    for (var i = 0; i < 3; i++) {
        attractionDescription = $("<div>").text(attractionInfo[i].perex).addClass("col s9");
        $("#attraction-"+i).append(attractionDescription);
    }
}

function convertCurrency() {
    $.ajax({
        url: "https://openexchangerates.org/api/latest.json",
        data: {
            app_id: "ff16ac4b98544573ad72e111ebeaaab0",
            base: "USD"
        },
        method: "GET"
    }).then(function(response) {
        var convertedCurrency = response.rates[countryCurrency].toFixed(2);
        $("#currency-conversion").html("1.00 USD <i class='material-icons'>compare_arrows</i> " + convertedCurrency + " " + countryCurrency);
    })
}

function translatePhrases() {
    if (countryLanguage !== "en") {
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
}

$("#user-phrase").keypress(function(event) {
    $("#user-phrase").removeClass("invalid").attr("placeholder", "What else do you want to say?");

    if (event.which !== 0) {
        charactersRemaining--; 
        $("#characters-remaining").text(charactersRemaining);
    }

    if (charactersRemaining < 0) {
        $("#user-phrase").addClass("invalid");
        $("#translate-button").addClass("disabled");
    }
})

$("#user-phrase").keydown(function(event) {
    if (event.which === 8 || event.which === 46) {
        if ($("#user-phrase").val().length === 0) {
            resetCharactersRemaining();
        }

        if (charactersRemaining < 50) {
            charactersRemaining++;
            $("#characters-remaining").text(charactersRemaining);
        }

        if (charactersRemaining >= 0) {
            $("#user-phrase").removeClass("invalid");
            $("#translate-button").removeClass("disabled");
        }
    }
})

$("#translate-button").on("click", function() {
    event.preventDefault();

    var userPhrase = $("#user-phrase").val().trim();
    $("#user-phrase").val("");

    resetCharactersRemaining();
    translateUserPhrase(userPhrase);
})

function resetCharactersRemaining() {
    charactersRemaining = 50;
    $("#characters-remaining").text(charactersRemaining);
}

function translateUserPhrase(userPhrase) {
    if (!userPhrase) {
        $("#user-phrase").removeClass("valid").addClass("invalid");
        $("#user-phrase").attr("placeholder", "Hmm, you haven't entered anything.")
    } else if (userPhrase.length > 50) {
        $("#user-phrase").attr("placeholder", "Sorry, you went over the character limit.")
    } else {
        $.ajax({
            url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
            data: {
                key: "trnsl.1.1.20180330T194416Z.40eb4150fb68a578.188f9ff63bebe1f224ee9bcc9e9567efed0a287f",
                lang: "en-" + countryLanguage,
                text: userPhrase
            },
            method: "GET"
        }).then(function(response) {
            $("#user-phrase-area").remove();
    
            var userPhraseArea = $("<li>").addClass("collection-item").attr("id", "user-phrase-area").text(userPhrase).appendTo("#translated-items");
            $("<br>").appendTo(userPhraseArea);
            $("<span>").text(response.text[0]).appendTo(userPhraseArea);
        })
    }
}

$("#information-back-button").on("click", function() {
    showCitiesView();
})
