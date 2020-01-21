// Leaflet Challenge

//  Step 1:
//  Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude
//   - Your data markers should reflect the magnitude of the earthquake in their size and color. Earthquakes with higher magnitudes should appear larger and darker in color
//   - Include popups that provide additional information about the earthquake when a marker is clicked
//   - Create a legend that will provide context for your map data

// Mapbox API key
var apiKey = "pk.eyJ1IjoicmxhYmVsbDEiLCJhIjoiY2s0YWpqNGhnMDRsZzNrcXQwZjZnemtzNyJ9.6ZIR6lGIvJxy9cSEeHn8-w";

// Variable: graymap
// Create tile layer from mapbox API
var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: apiKey
});

// Variable: map
// Create Leaflet map object
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3
});

// Adding tile layer to Leaflet map object
graymap.addTo(map);

// AJAX call: 
// Retrieve geoJSON data and apply functions
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
  }).addTo(map);

  // Create map legend as Leaflet control object
  var legend = L.control({
    position: "bottomright"
  });

  // Add color details to the legend
  // Create intervals for color coding each level of magnitude
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

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
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Adding legend to Leaflet map
  legend.addTo(map);
});
