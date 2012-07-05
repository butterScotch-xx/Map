// The layers.js class manages the use of layers on the map
define([], function () {

    // Keywords
    var WEATHER = "weather";
    var TRAFFIC = "traffic";
    
    var layers = {};
    var layersInit = {};
    layersInit[WEATHER] = initWeatherLayer;
    layersInit[TRAFFIC] = initTrafficLayer;
    var map;
    
    function setMap(gmap){
        map = gmap;
    }

    // These layer on / off are written to be public but I can't think of a convincing reason to make them so yet
    function layerOff(layerString) {
        var layer = layers[layerString];
        (layer) ? layer.setMap(null) : console.debug('Cannot find layer');
    }

    function layerOn(layerString) {
        var layer = layers[layerString];
        (layer) ? layer.setMap(map) : console.debug('Cannot find layer or map not set');
    }

    function initLayer(layerString, options) {
        if (!layersInit.hasOwnProperty(layerString)) {
            return;
        }
        layersInit[layerString](options);
    }

    function initTrafficLayer(options) {
        layers.traffic = new google.maps.TrafficLayer();
        if (options) {
            layers.traffic.setOptions(options);
        }
        makeTrafficControl('TOP_LEFT');
    }

    function initWeatherLayer(options) {
        if (google.maps.weather) {
            layers.weather = new google.maps.weather.WeatherLayer();
            if (options) {
                layers.weather.setOptions(options);
            }
            makeWeatherControl('TOP_LEFT');
        }
    }
        
    function makeWeatherControl(position) {
        
        var controlDiv = document.createElement('div');
    
        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        controlDiv.style.padding = '5px';
    
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUIStyle(controlUI, 'Click to toggle the weather layer');
        controlDiv.appendChild(controlUI);
    
        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlTextStyle(controlText, 'Weather');
        controlUI.appendChild(controlText);
    
        // Setup the click event listeners: simply set the map to Chicago.
        google.maps.event.addDomListener(controlUI, 'click', function() {
            layers.weather.getMap() ? layerOff(WEATHER) : layerOn(WEATHER);
        });
        
        if(!map) {
            console.debug('Map has not been set');
        }
        
        map.controls[google.maps.ControlPosition[position]].push(controlDiv);
    
    }

    function makeTrafficControl(position) {
    
        var controlDiv = document.createElement('div');
    
        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        controlDiv.style.padding = '5px';
    
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUIStyle(controlUI, 'Click to toggle the traffic layer');
        controlDiv.appendChild(controlUI);
    
        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlTextStyle(controlText, 'Traffic');
        controlUI.appendChild(controlText);
    
        // Setup the click event listeners: simply set the map to Chicago.
        google.maps.event.addDomListener(controlUI, 'click', function() {
            layers.traffic.getMap() ? layerOff(TRAFFIC) : layerOn(TRAFFIC);
        });
    
        if(!map) {
            console.debug('Map has not been set');
        }
        
        map.controls[google.maps.ControlPosition[position]].push(controlDiv);
    }
    
    function controlUIStyle(controlUI, title) {
        controlUI.style.backgroundColor = 'white';
        controlUI.style.borderStyle = 'solid';
        controlUI.style.borderWidth = '2px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = title;
    }
    
    function controlTextStyle(controlText, text) {
        controlText.style.fontFamily = 'Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.paddingLeft = '4px';
        controlText.style.paddingRight = '4px';
        controlText.innerHTML = '<strong>' + text + '<strong>';
    }

    // Public Methods
    // WEATHER static string type
    // TRAFFIC static string type
    // initLayer initializes layer from map element, layer type, and options
    // layer off and on take a layer type string and do as specified. Map must be set first
    return {
        WEATHER : WEATHER,
        TRAFFIC : TRAFFIC,
        initLayer : initLayer,
        layerOn : layerOn,
        layerOff : layerOff,
        setMap : setMap
    }
});// end of module