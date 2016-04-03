

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

		function filterBars(layer, namedBar){
		 	layer({
		 		filter: function(feature, layer){
		 			return feature.properties.Name == namedBar; 
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

		$("input").keyup(function(){
			var userBar = $(this).val();
			map.removeLayer(pubClusters);
			filterBars(pubs, userBar);
		});
		
	});

});





