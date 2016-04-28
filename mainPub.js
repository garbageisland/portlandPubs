var searchTimer,
    resizeTimer;

var allPubs;
var allPubNames = [];

var map = L.map('map',{
    zoomControl: false
});   

var stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});

var pubIcon = L.icon({
    iconUrl: 'pubIcon.png',
    iconSize: [60, 50]
});

var pubClusters = L.markerClusterGroup({
    iconCreateFunction: function(cluster){
        return pubIcon;
    },
    showCoverageOnHover: false
});

/*-----------------------------------------*/
/*------------- UI FUNCTIONS --------------*/
/*-----------------------------------------*/


// this is what i assume a namespace is for javascript
// it's like turning the functions into objects? like
// the concept of a member function? i dono but it works.

var interface = function(){
    function fullscreen(){
        var height = window.innerHeight;
        var width = window.innerWidth;

        $('#map').css('height', height);
    }

    function showhide(elem, state){
        var prefix = 'u-';
        if(state == 'undefined'){
            $(elem).toggleClass('u-show u-hide');
        } else {
            var oldState = (state == 'show') ? prefix+'hide' : prefix+'show';
            $(elem).removeClass(oldState).addClass(prefix+state);
        }
    }

    // gotta release all those functions into the wild
    return {
        fullscreen:fullscreen,
        showhide:showhide,
    }

// note the () that happens after this function
// i think it's super important but can't really say why
}();

/*-----------------------------------------*/
/*------------- MAP ACTIONS ---------------*/
/*-----------------------------------------*/


// this is a "clusterfuck", haha. i just put shit here.
// i don't really know what to do with it yet, but i'm 
// thinking the function will mostly be related to map results
var action = function(){
    function performSearch(userBar){
        window.clearTimeout(searchTimer);
        interface.showhide('i.search-active', 'hide');
        
        var updatedBars = L.geoJson(allPubs,{
            filter: function(feature, layer){
                return feature.properties.Name == userBar; 
            },

            onEachFeature: function(feature, layer){
                layer.bindPopup("<b>Pub Name:</b>" + " " + feature.properties.Name);
            },

            pointToLayer: function(feature, latlng){
                return L.marker(latlng,{icon: pubIcon});
            }
        }).addTo(map);
    }

    function drawClusters(data){
        var pubs = L.geoJson(data,{
            pointToLayer: function(feature, latlng){
                return L.marker(latlng,{icon: pubIcon});
            },

            onEachFeature: function(feature, layer){
                layer.bindPopup("<b>Pub Name:</b>" + " " + feature.properties.Name);
                // while we're at it, i thought this array might make for an easier
                // searchable index in the future...tho probably not the best place
                // to create it
                allPubNames.push(feature.properties.Name);
            }
        });

        pubClusters.addLayer(pubs);
        map.addLayer(pubClusters);
    }

    return {
        performSearch:performSearch,
        drawClusters:drawClusters,
    }
}();

/*-----------------------------------------*/
/*---------- EVENT LISTENERS --------------*/
/*-----------------------------------------*/

$("#searchBar").on('input change', function(){
    var userBar = $(this).val();
    var value = $.trim(userBar);

    if(userBar.length > 0){
        map.removeLayer(pubClusters);
    }
    else{
        map.addLayer(pubClusters);
    }
    window.clearTimeout(searchTimer);

    // TODO: make this present when actually fetching results...
    interface.showhide('i.search-active', 'show');

    searchTimer = window.setTimeout(function(){
        action.performSearch(userBar);
    }, 500);    
});

//*
$(window).resize(function(){
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function(){
        // set the timer variable just so we don't
        // overtask a user's processor on this function
        interface.fullscreen();
    }, 500);
});
//*/

$(document).ready(function(){
    // this probably makes no difference, but
    // moved this to end so that we know all 
    // necessary functions/variables are loaded
    interface.fullscreen();

    $.getJSON('portlandPubs.geojson', function(data){
        // put all this data in a variable so we
        // only need to ajax the server once
        allPubs = data;
        // initial drawing needs to happen in this
        // function becase of async javascript, i 
        // think. ie, allPubs data does not necessarily
        // exist on the outside yet, but will in later functions??
        //*
        action.drawClusters(allPubs);
        //*/
    });

    // map's fullscreen size was set before map view is set
    map.setView([45.52, -122.67], 10);
    stamenToner.addTo(map);
});
