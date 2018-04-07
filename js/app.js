var config = {
    apiKey: "AIzaSyCSkaFkm-v3v3CtdcLnV-OC1wujd10vjbQ",
    authDomain: "wanderlust-1522437515707.firebaseapp.com",
    databaseURL: "https://wanderlust-1522437515707.firebaseio.com",
    projectId: "wanderlust-1522437515707",
    storageBucket: "wanderlust-1522437515707.appspot.com",
    messagingSenderId: "403541142142"
  };
firebase.initializeApp(config);

var recents = firebase.database().ref("recents/");
var recentCities = [];

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
        backgroundColor: '',
        hoverColor: '#bda24b',
        selectedColor: '#bda24b',
        onRegionClick: function(event, code, region) {
            countryCode = code;
            $.ajax({
                url: "https://secure.geonames.org/countryInfoJSON",
                data: {
                    username: "carladdg",
                    country: countryCode
                },
                method: "GET"
            }).then(function (response) {
                countryName = response.geonames[0].countryName;
                countryCurrency = response.geonames[0].currencyCode;

                var spokenLanguages = response.geonames[0].languages;
                countryLanguage = spokenLanguages.slice(0, 2);

                var north = response.geonames[0].north.toFixed(1);
                var south = response.geonames[0].south.toFixed(1);
                var east = response.geonames[0].east.toFixed(1);
                var west = response.geonames[0].west.toFixed(1);

                findCities(north, south, east, west);
            })
        }
    });
});

recents.on("value", function(snapshot) {
    $("#recent-destinations").empty();
    recentCities = snapshot.val();

    for (var i = 0; i < recentCities.length; i++) {
        $("<a>")
            .addClass("waves-effect waves-light btn recent-city gold-text")
            .text(recentCities[i].city.name)
            .attr('data-index', i)
            .appendTo("#recent-destinations");
    }
})

$(document).on("click", ".recent-city", function() {
    selectedCity = recentCities[$(this).attr('data-index')].city;
    countryName = recentCities[$(this).attr('data-index')].country;
    countryCurrency = recentCities[$(this).attr('data-index')].currency;
    countryLanguage = recentCities[$(this).attr('data-index')].language;

    generateCityInfo(selectedCity);
    showInformationView();  
    
    $("#information-back-button").hide();
    $("#recent-city-back-button").show();
})

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

$("#cities-back-button").on("click", function () {
    showMapView();
})

function showMapView() {
    $("#map-view").show();

    $("#cities-view").hide();
    $("#information-view").hide();

    $('#vmap').vectorMap('set', 'colors', {[countryCode]: '#f4f3f0'});
}

$(".city").on("click", function () {
    selectedCity = cities[$(this).attr("data-city")];

    generateCityInfo(selectedCity);
    showInformationView();

    $("#information-back-button").show();
    $("#recent-city-back-button").hide();

    var selectedCityInfo = {
        city: selectedCity,
        country: countryName,
        language: countryLanguage,
        currency: countryCurrency
    }

    let alreadyRecent = false;
    recentCities.forEach(e => {
        if(e.city.name == selectedCity.name)
            alreadyRecent = true;
    });
    
    if (!alreadyRecent) {
        recentCities.push(selectedCityInfo);
        recentCities.shift();
        recents.set(recentCities);
    }
})

function generateCityInfo(selectedCity) {
    var selectedCityName = selectedCity.name;

    $("#selected-city").text(selectedCityName);
    $("#country-name").text(countryName);

    var destinationDiv = $("div").find("[data-element='destination-field']");
    destinationDiv.attr("id", "toDestination");
    $("#toDestination :input").val(selectedCityName);

    var lat1 = selectedCity.lat;
    var lng1 = selectedCity.lng;
    var lat2 = lat1 + 0.02;
    var lng2 = lng1 + 0.02;
    var coordinates = lat1 + "," + lng1 + "," + lat2 + "," + lng2;

    displayCityGreeting(selectedCityName);
    findAttractions(coordinates);
    convertCurrency();
    populateFlightDestination(selectedCityName);
    translatePhrases();
}

function showInformationView() {
    $("#information-view").show();

    $("#map-view").hide();
    $("#cities-view").hide();

    if (countryLanguage === "en") {
        $("#user-translation-area").hide()
    } else {
        $("#user-translation-area").show()
    }
}

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

    for (var i = 0; i < 3; i++) {
        attractionImage = $("<img>").attr("src", attractionInfo[i].thumbnail_url).addClass("col s3");
        $("#attraction-"+i).append(attractionImage);
    }
    for (var i = 0;  i < 3; i++) {
        attractionName = $("<div>").html(attractionInfo[i].name + "<br>" + "<br>").addClass("col s9 gold-text center-align merienda-one");
        $("#attraction-"+i).append(attractionName);
    }
    for (var i = 0; i < 3; i++) {
        attractionMarker = $("<div>").html(attractionInfo[i].marker + "<br>" + "<br>").addClass("col s9 knewave purple-text");
        $("#attraction-"+i).append(attractionMarker);
    }
    for (var i = 0; i < 3; i++) {
        attractionDescription = $("<div>").html(attractionInfo[i].perex + "<br>" + "<br>").addClass("col s9 opensans");
        $("#attraction-"+i).append(attractionDescription);
    }
    for (var i = 0; i < 3; i++) {
        attractionMapLink = $("<a>").attr("href", attractionInfo[i].url).attr("target", "_blank").addClass("col s9 opensans").text("Click Here to Check Its Location!");
        $("#attraction-"+i).append(attractionMapLink);
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
    }).then(function (response) {
        var convertedCurrency = response.rates[countryCurrency].toFixed(2);
        $("#currency-conversion").html("1.00 USD <i class='material-icons'>compare_arrows</i> " + convertedCurrency + " " + countryCurrency);
    })
}

function populateFlightDestination(selectedCityName) {
    var destinationDiv = $("div").find("[data-element='destination-field']");
    destinationDiv.attr("id", "toDestination");
    $("#toDestination :input").val(selectedCityName);
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
    } else {
        for (var i = 0; i < helpfulPhrases.length; i++) {
            $("#phrase-" + i).empty();
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

$("#information-back-button").on("click", function () {
    showCitiesView();
})

$("#recent-city-back-button").on("click", function () {
    showMapView();
})