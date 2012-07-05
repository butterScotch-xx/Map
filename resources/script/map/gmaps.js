define(['utils/utils','map/markers', 'map/layers', 'map/infowindow', 'map/accessory/sidebar'], function(Utils, Markers, Layers, InfoWindow, SideBar) {

    var map;
    window.mapPrefix = "rMap:0:";
    
    // TODO: Figure out how to center the map
    
    function init() {
        var center = new google.maps.LatLng(41.81378, -88.01016);
        var mapElem = self.document.getElementById(mapPrefix + "map_canvas");
        
        if(mapElem === null) {
          console.debug('Map element not found');
          return;
        }
    
          var options = {
              zoom: 8,
              center: center,
              scaleControl: true,
              mapTypeControl: true,
              mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
              },
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          
          window.Layers= Layers;// REMOVE
          window.Markers = Markers;// REMOVE
          
          map = new google.maps.Map(mapElem, options);
          
          if(SideBar) SideBar.init(mapElem); 
  
          Layers.setMap(map);
          Layers.initLayer(Layers.TRAFFIC);
          Layers.initLayer(Layers.WEATHER, {temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT});
          
          Markers.setMap(map);
          Markers.build();
            
    }
    
    function refresh() {
        var comp = AdfPage.PAGE.findComponent(mapPrefix+'refresh');
        AdfActionEvent.queue(comp, true);
    }
    
    function panToMarker(key, type) {
      var marker = Markers.findMarker(key, type);
      if(!marker) {
        console.error('Cannot find marker');
        return;
      }
      map.panTo(marker.getPosition());
    }
    
    var Data = {
      refreshEQData : Markers.refreshEQMarkers,
      refreshDRData : Markers.refreshDRMarkers,
      refreshDLData : Markers.refreshDLMarkers,
      refreshPUData : Markers.refreshPUMarkers,
      refreshAllData : Markers.refreshAllMarkers
    }
    
    
    // Public Methods
    // init initializes the map
    // refreshes the map
    // panToMarker takes a key and optional type value 
    return {
      init : init,
      refreshMap : refresh,
      loadContent : InfoWindow.loadContent,
      panToMarker : panToMarker,
      Data : Data
    }
}); // end of module