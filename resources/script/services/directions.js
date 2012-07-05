// The directions.js class manages the use of the directions api on the map
define([], function () {

    var windowOptions = {
        maxWidth : 40
    };
    var infowindow = new google.maps.InfoWindow(windowOptions);
    var markers = [];
    var wayPoints = [];
    var windowMarker;
    var map;
    
    // Tells the map when to route the selected icons (when you let go of the shift key)
    // if we use multi icon selection for something else later we will want to change this to 
    // listen for ctrl + R or something
    window.addEventListener("keyup",routeListener);
    
    function routeListener(event) {
      if(event.keyIdentifier === 'Shift' && !directionsDisplay.getMap()){
        if(markers.length > 1) {
         _route();
         infowindow.open(map, windowMarker); // has to be here for some reason, can't be in _route
         window.addEventListener("keyup",hideDirectionsListener); // clears the route display
       }
      }
    }
    
    // Internal route function
    function _route() {
      var req = {origin : markers[0].getPosition(), destination: markers[markers.length-1].getPosition()};
      
      if(wayPoints.length)
        req.waypoints = wayPoints;
        
      routeOnMap(req);
    }

    // Defaulted directions Request
    // allows users to only need to pass a origin / destination
    var directionsRequest = {
        travelMode : google.maps.DirectionsTravelMode.DRIVING,
        unitSystem : google.maps.UnitSystem.IMPERIAL,
        optimizeWaypoints : false,
        provideRouteAlternatives : false,
        avoidHighways : false,
        avoidTolls : false
    }

    var displayOptions = {
        suppressMarkers : true,
        preserveViewport : true // optional, note sure what is best
    }

    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    function setMap(gmap) {
        map = gmap; // needed for infowindow
    }

    // Only need origin / destination
    // Returns route response
    function route(request, callback) {
        if (!request.hasOwnProperty('origin') || !request.hasOwnProperty('destination'))
            return;
        if (!callback || typeof callback !== 'function')
            return;

        for (var i in request) {
            directionsRequest[i] = request[i];
        }

        directionsService.route(directionsRequest, callback);
    }

    // Only need origin / destination
    // Displays route response on map
    function routeOnMap(request) {

        if (!request.hasOwnProperty('origin') || !request.hasOwnProperty('destination'))
            return;

        for (var i in request) {
            directionsRequest[i] = request[i];
        }
        
        directionsService.route(directionsRequest, routeCallback);
    }
    
    function routeCallback(res, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setOptions(displayOptions);
                directionsDisplay.setDirections(res);
                directionsDisplay.setMap(map);
                
                var route = res.routes[0];
                var params = {};
                params.origin = route['legs'][0].start_address;
                params.destination = route['legs'][0].end_address;
                params.distance = route['legs'][0].distance.text;
                params.duration = route['legs'][0].duration.text;
                params.warnings = route['legs'][0].warnings;
                
                infowindow.setContent(makeWindowContent(params));
            }
            else {
                console.debug('Could not route : ' + status);
            }
        }
    
    function makeWindowContent(params) {
      var content = "";
      content += "<strong>Route Information </strong> <br/><br/>";
      content += "<strong>Origin </strong> : " + params.origin + "<br/><br/>";
      content += "<strong>Destination </strong> : " + params.destination + "<br/><br/>";
      content += "<strong>Distance </strong> : " + params.distance + "<br/><br/>";
      content += "<strong>Duration </strong> : " + params.duration + "<br/><br/>";
      
      if(params.warnings) {
        content += "<strong>Warnings </strong> : ";
        for(var msg in params.warnings) {
          content += msg + "<br/>"
        }
      }
      infowindow.setContent(content);
    }

    // ---------------------------------------------------- //
    // ------------- Marker Management Functions ---------- // 
    function clearMarkers() {
        if (markers.length) {
            markers.splice(0, markers.length);
            wayPoints.splice(0,wayPoints.length);
            directionsDisplay.setMap(null);   
            infowindow.close();
        }
    }
    
    function hideDirectionsListener(event) {
      if(event.keyIdentifier === 'U+001B'){
        clearMarkers();
        window.removeEventListener("keyup",hideDirectionsListener);
      }
    }
    
    function addMarker(marker) {
       markers.push(marker);
       if(markers.length > 2) {
         var waypoint = {location : markers[markers.length-2].getPosition(), stopover: false};
         wayPoints.push(waypoint);
       }
       if(markers.length > 1) {
         windowMarker = marker;
       }
    }
    
    // PUBLIC METHODS
    // routeOnMap takes an object with origin / destination properties and displays the route on the map
    // route takes an object with origin / destination properties with a callback function which you specify yourself
    // setMap sets the map object for the display renderer
    // addMarker adds a marker to the markers array
    // clearMarkers clears the markers array
    return {
        routeOnMap : routeOnMap,
        route : route,
        setMap : setMap,
        clearMarkers : clearMarkers,
        addMarker : addMarker
    }
});// end of module