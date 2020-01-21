// Leaflet Challenge

//  Step 2: 
//   - Plot a second data set on our map
//   - Add a number of base maps to choose from as well as separate out our two different data sets into overlays that can be turned on and off independently
//   - Add layer controls to our map

// Mapbox API key
var apiKey = "pk.eyJ1IjoicmxhYmVsbDEiLCJhIjoiY2s0YWpqNGhnMDRsZzNrcXQwZjZnemtzNyJ9.6ZIR6lGIvJxy9cSEeHn8-w";

//////////////////////////////////
// Creating Leaflet Map Objects:
//////////////////////////////////

// Create tile layers
// Tile Layer 1: Grayscale
var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: apiKey
});

// Tile Layer 2: Satelite View 
var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: apiKey
});

// Tile Layer 3: Geographic Detail
var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: apiKey
});

// Create Leaflet map object
// Add tile layers to an array of Leaflet map layers
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoors]
});

// Add 'graymap' tile layer to Leaflet map
graymap.addTo(map);

// Create two Leaflet map overlay layers for each set of data, earthquakes and tectonicplates
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Define an object to contain exclusive tile choices
var baseMaps = {
  Satellite: satellitemap,
  Grayscale: graymap,
  Outdoors: outdoors
};

// Define an object to contain inclusive map overlays
var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Add a control to Leaflet map, allowing tile layer and overlay changes
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

  
////////////////////////////////
// Adding Data to Leaflet Map:
////////////////////////////////

// AJAX call: 
// Retrieve earthquake geoJSON data, then apply functions
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Function: styleInfo
  // Return style data for each earthquake we plot
  // Pass the magnitude of each earthquake into two functions (getColor & getRadius) to calculate color and radius
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag), // Function: getColor
      color: "#000000",
      radius: getRadius(feature.properties.mag), // Function: getRadius
      stroke: true,
      weight: 0.5
    };
  }

  // Function: getColor
  // Determine the color of each marker based on earthquake magnitude
  function getColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#ea822c";
    case magnitude > 3:
      return "#ee9c00";
    case magnitude > 2:
      return "#eecc00";
    case magnitude > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // Function: getRadius 
  // Determine the radius of each earthquake marker based on magnitude
  // If magnitude = 0, marker radius = 1
  // Else, marker radius = magnitude * 4
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Leaflet Function: geoJson
  // Add GeoJSON layer to Leaflet map 
  L.geoJson(data, {
    // Leaflet Function: pointToLayer
    // Convert each feature into a circleMarker on the map
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker by using the styleInfo function
    style: styleInfo,
    // Leaflet Function: onEachFeature
    // Create a popup for each marker, display magnitude and location of each earthquake
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // We add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(map);

  // Create map legend as Leaflet control object
  var legend = L.control({
    position: "bottomright"
  });

  // Add color details to the legend
  // Create intervals for color coding each level of magnitude
  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop through legend intervals to generate labels with a color for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to Leaflet map
  legend.addTo(map);

  // AJAX call:  
  // Retrieve tectonicplates geoJSON data, then apply functions
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Add geoJSON data & style information, to the tectonicplates overlay layer
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // Add tectonicplates overtlay layer to the map
      tectonicplates.addTo(map);
    });
});
