// gotta make this a global thingy so we can call
// it wherever we need it
var searchTimer;

var map = L.map('map',{
			zoomControl: false
		});   

map.setView([45.52, -122.67], 12);

var stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
  					attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
				});

stamenToner.addTo(map);

$(document).ready(function(){
	$.getJSON('portlandPubs.geojson', function(data){
		var pubIcon = L.icon({
			iconUrl: 'pubIcon.png',
			iconSize: [60, 50]
		});

		
		var pubs = L.geoJson(data,{
			pointToLayer: function(feature, latlng){
				return L.marker(latlng,{icon: pubIcon});
			},

			onEachFeature: function(feature, layer){
			layer.bindPopup("<b>Pub Name:</b>" + " " + feature.properties.Name);
			}
	
		});

		function filterBars(namedBar){
		 	var updatedBars = L.geoJson(data,{
		 		filter: function(feature, layer){
		 			return feature.properties.Name == namedBar; 
		 		},

		 		onEachFeature: function(feature, layer){
				layer.bindPopup("<b>Pub Name:</b>" + " " + feature.properties.Name);
				},

				pointToLayer: function(feature, latlng){
				return L.marker(latlng,{icon: pubIcon});
				}
		 	}).addTo(map);
		}


		var pubClusters = L.markerClusterGroup({
			iconCreateFunction: function(cluster){
				return pubIcon;
			},
			showCoverageOnHover: false
		});

		pubClusters.addLayer(pubs);
		map.addLayer(pubClusters);

        $("#searchBar").on('input change', function(){
            // at this stage, we set the search value just in case
            var userBar = $(this).val();
            var value = $.trim(userBar);

            if(userBar.length > 0){
                map.removeLayer(pubClusters);
            }
            else{
                map.addLayer(pubClusters);
            }
            // upon any changes to the input we want to make sure
            // we start with a fresh countdown, so we clear the 
            // timeout variable before starting a new one
            window.clearTimeout(searchTimer);

            // show the spinny loader so we knows it's waiting for us
            // TODO: make this present when actually fetching results...
            showHide('i.search-active', 'show');

            // set the timer variable to perform the search function
            // with available input after waiting 500ms
            searchTimer = window.setTimeout(function(){
                performSearch(userBar);
            }, 500);    
        });

        function performSearch(userBar){
            // we start the search function by clearing the timeout
            // because we don't need it anymore
            window.clearTimeout(searchTimer);
            showHide('i.search-active', 'hide');

            // the actual search functioning
            //map.removeLayer(pubClusters);
            filterBars(userBar);
        }

        function showHide(elem, state){
            // this sets up a function for reuse, i personally
            // find that i do this show/hide stuff a lot
            var prefix = 'u-';
            if(state == 'undefined'){
                // simple toggle doesn't always work out, but
                // it's easy
                $(elem).toggleClass('u-show u-hide');
            } else {
                // specifies when to show or hide, this was needed
                // because the state would get toggled for each key
                // pressed in the input otherwise, probably a simpler
                // way to do all of that
                var oldState = (state == 'show') ? prefix+'hide' : prefix+'show';
                $(elem).removeClass(oldState).addClass(prefix+state);
            }
        }

	});

});