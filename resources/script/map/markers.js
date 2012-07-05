// The markers.js class returns an object which will construct and manager the gmaps markers 
// NOTE: BuildMarker function not yet implemented

define(["utils/utils", "utils/filter", "services/geo","map/dataloader", "map/infowindow", 'services/directions', 'map/accessory/sidebar', 'map/accessory/zoom'],
        function(Utils, Filter, Geo, DataLoader, InfoWindow, Directions, SideBar, Zoom) {

    var Icons = {}; // Object which holds the icons
    var markerGroups = {};
    var map;
    
    // ---------------------------------------------------- //
    // ----------------- INIT FUNCTIONS ------------------- // 
    
    function setMap(gmap){
        map = gmap;
    }
    
    // function which should be called when initializing the marker groups
    // loads images and all data types
    function build() {
        var data, rows;
        try {
          loadImages();
          
          if(Filter) Filter.init(map);
          
          data = DataLoader.loadData();
          rows = buildRows(data);
          buildMarkers(rows);
          
          if(Zoom) {
            Zoom.setMap(map);
            Zoom.sort(markerGroups);
            markerGroups = Zoom.collapse(3);
          }
          
          displayMarkers();
          buildEventListeners();
        } catch (e) {
          console.log(e);
          console.error(e.message);
          console.error(e.stack);
        }
    }
    
    function buildEventListeners() {
        "use strict";
        var targets = ['puChk', 'dlChk', 'drChk', 'raChk', 'deChk', 'eqChk', 'reChk'];
        var _;  // temporary variable to hold components
        for(var i = 0; i < targets.length; i++) {
            _ = Utils.adfFind$(mapPrefix + targets[i]);
            (_) ? _.addEventListener("click", toggleGroup) : console.debug('Cannot find toggle');
        }
        
        _ = Utils.adfFind$(mapPrefix + 'showAll');
        (_) ? _.addEventListener("click", toggleAll) : console.debug('Cannot find toggle');
        
        // add event listeners which listen for data changes on mapEQData etc
        _ = Utils.adfFind$(mapPrefix + 'mapEQData');
        (_) ? _.addEventListener("propertyChange", refreshEQMarkers) : console.debug('Cannot find EQ data source');
        
        _ = Utils.adfFind$(mapPrefix + 'mapDRData');
        (_) ? _.addEventListener("propertyChange", refreshEQMarkers) : console.debug('Cannot find DR data source');
        
        _ = Utils.adfFind$(mapPrefix + 'mapPUData');
        (_) ? _.addEventListener("propertyChange", refreshEQMarkers) : console.debug('Cannot find PU data source');
        
        _ = Utils.adfFind$(mapPrefix + 'mapDLData');
        (_) ? _.addEventListener("propertyChange", refreshEQMarkers) : console.debug('Cannot find DL data source');
        
        _ = Utils.adfFind$(mapPrefix + 'mapWindowData');
        (_) ? _.addEventListener('propertyChange', InfoWindow.loadContent) : console.debug('Cannot find Window data source');
        
        (Zoom) ? google.maps.event.addListener(map, 'zoom_changed', listenZoom) : "";
        
        addMarkerListeners();
    }
    
    function addMarkerListeners() {
      for(var prop in markerGroups) {
        var group = markerGroups[prop];
        group.forEach(function(marker,i,arr){
        
          google.maps.event.addListener(marker, 'click', function(e) {
          console.log(e);
                if(e.b.shiftKey) {
                   Directions.setMap(map);
                   marker.setAnimation(google.maps.Animation.BOUNCE);
                   setTimeout(function () { marker.setAnimation(null) }, 750); // approximately how long it takes to bounce once
                   Directions.addMarker(marker);
                } else if (e.b.ctrlKey) {
                   SideBar.showBar();
                } else {
                
                  Directions.clearMarkers();
                  InfoWindow.open(map, marker);
                  map.panTo(marker.getPosition()); // temporary code for now. Will want to have this do something real later
                }
          });
        
        });
      }
              
    }
    
    function addMultiMarkerListeners() {
      var group = markerGroups[Utils.TYPES.MULTI];
        group.forEach(function(marker,i,arr){
          google.maps.event.addListener(marker, 'click', function(e) {
                  
                if(e.b && e.b.shiftKey) {
                   Directions.setMap(map);
                   marker.setAnimation(google.maps.Animation.BOUNCE);
                   setTimeout(function () { marker.setAnimation(null) }, 750); // approximately how long it takes to bounce once
                   Directions.addMarker(marker);
                } else if (e.b && e.b.ctrlKey) {
                   SideBar.showBar();
                } else {
                
                  Directions.clearMarkers();
                  InfoWindow.open(map, marker);
                  map.panTo(marker.getPosition()); // temporary code for now. Will want to have this do something real later
                }
          });
        });
    }
    
    function listenZoom () {
      clearAllMarkers();
      markerGroups = Zoom.reCollapse();
      addMultiMarkerListeners();
      displayMarkers();
    }
    
    function loadImages() {
         "use strict";
         var imagePath = "../../resources/images/";
         Icons.deliveryIcon = new google.maps.MarkerImage(imagePath + "delivery_2.png");
         Icons.pickupIcon = new google.maps.MarkerImage(imagePath + "pickup_2.png");
         Icons.rampIcon = new google.maps.MarkerImage(imagePath + "train_2.png");
         Icons.equipmentIcon = new google.maps.MarkerImage(imagePath + "equipment_2.png");
         Icons.driverIcon = new google.maps.MarkerImage(imagePath + "truck_2.png");
         Icons.hubIcon = new google.maps.MarkerImage(imagePath + "hub_2.png");
         Icons.depotIcon = new google.maps.MarkerImage(imagePath + "depot_3.png");
         Icons.yardIcon = new google.maps.MarkerImage(imagePath + "reservation_2.png");
         Icons.imagePath = imagePath;
        
    }
    
    // ---------------------------------------------------- //
    // --------------- REFRESH FUNCTIONS ------------------ // 
    
    // Refresh functions have not been tested
    function refreshAllMarkers() {
        refreshEQMarkers();
        refreshDRMarkers();
        refreshDLMarkers();
        refreshPUMarkers();
    }
    
    function refreshEQMarkers() {
        "use strict";
        //clearMarkerGroup(Utils.TYPES.EQUIPMENT);
        clearAllMarkers();
        var _rows = buildRows(DataLoader.loadEquipData());
        if(!_rows) return;
        _rows.forEach(rowToMarker);
        markerGroups = (Zoom) ? Zoom.collapse(markerGroups) : markerGroups;
        console.log(markerGroups);
        displayMarkers(Utils.TYPES.EQUIPMENT);
        displayMarkers(Utils.TYPES.RESERVATION);
        displayMarkers(Utils.TYPES.MULTI);
        displayMarkers(Utils.TYPES.DEPOT);
    }
    
    function refreshDRMarkers() {
        "use strict";
        clearMarkerGroup(Utils.TYPES.DRIVER);
        var _rows = buildRows(DataLoader.loadDriverData());
        if(!_rows) return;
        _rows.forEach(rowToMarker);
        displayMarkers(Utils.TYPES.DRIVER);
    }
    
    function refreshPUMarkers() {
        "use strict";
        clearMarkerGroup(Utils.TYPES.PICKUP);
        var _rows = buildRows(DataLoader.loadPickupData());
        if(!_rows) return;
        _rows.forEach(rowToMarker);
        displayMarkers(Utils.TYPES.PICKUP);
    }
    
    function refreshDLMarkers() {
        "use strict";
        clearMarkerGroup(Utils.TYPES.DELIVERY);
        var _rows = buildRows(DataLoader.loadDeliveryData());
        if(!_rows) return;
        _rows.forEach(rowToMarker);
        displayMarkers(Utils.TYPES.DELIVERY);
    }
    
    // ---------------------------------------------------- //
    // --------------- RED MEAT FUNCTIONS ------------------ // 
    
    // If data set is specified, build from that data set
    // Otherwise build data from shared data object
    function buildRows(data) {
        var rows = []; // _ is used as a temporary variable
        for(var prop in data) {
            rows = rows.concat(data[prop]);
        }
        return rows;
    }
    
    // If type is specified, only update display of markers of that type
    // otherwise update all types
    function displayMarkers(type) {
        var display = true;
        var comp;
        var state = Filter.getState();
        // update specified types
        if(type && markerGroups.hasOwnProperty(type)) {
            if(state[type]) {
                    markerGroups[type].forEach(function (e, i, arr) {
                        e.setMap(map);
                    });
            }
            return;
        }
        
        // Update display of all types
        for(var prop in markerGroups) {
              if(state[prop]){
                  markerGroups[prop].forEach(function (e, i, arr) {
                         e.setMap(map);
                });
            }
        }
    }
    
    function buildMarker(row) {
        if(!row || !assignMarker.hasOwnProperty(row['type'])) return;
        
        var type = row['type'];
        var key = row['key']; // may want to attach this to the marker somehow so when they click we can retrieve data
        var lat = row['latitude'];
        var lng = row['longitude'];
        var title = key + " " + row['locName'] + " " + row['city'] + "," + row['state'];
        var point = new google.maps.LatLng(lat, lng);
    
        var marker = new google.maps.Marker({
            position: point,
            title: title,
            animation: google.maps.Animation.DROP, // REMOVE Maybe
            draggable:true // REMOVE
        });
        // Open to other suggestions on how to get this data around w/ marker
        marker.type = type;
        marker.key = key;
      
        assignMarker[type](marker);
        
    }
    
    // Initizalizes the marker groups and attempts to build a marker off existing lat long
    // otherwise take address using google geocoder and build marker off resulting lat long
    
    function buildMarkers(_rows) {
        "use strict";
        if(!_rows) return;
        
        markerGroups[Utils.TYPES.PICKUP] = []; // Pickup
        markerGroups[Utils.TYPES.DELIVERY] = []; // Delivery
        markerGroups[Utils.TYPES.DRIVER] = []; // Driver
        markerGroups[Utils.TYPES.RAMP] = []; // Ramp (how are we going to get these locations?)
        markerGroups[Utils.TYPES.YARD] = []; // Yard (how are we going to get these locations?)
        markerGroups[Utils.TYPES.EQUIPMENT] = []; // Equipment
        markerGroups[Utils.TYPES.DEPOT] = []; // Depot (how are we going to get these locations?)
        markerGroups[Utils.TYPES.TERMINAL] = []; // Terminal (how are we going to get these locations?)
        markerGroups[Utils.TYPES.MULTI] = []; // The markers which for locations with multiple elements
    
        _rows.forEach(rowToMarker);
    }
    
    // Body of forEach loop
    
    function rowToMarker(row, i, arr) {
        "use strict";
        var lat = row["latitude"];
        var lng = row["longitude"];
        (lat && lng) ? buildMarker(row) : buildFromAddress(row);
    }
    
    var assignMarker = {};
    assignMarker[Utils.TYPES.PICKUP] = function(marker) {
        marker.setIcon(Icons.pickupIcon);
        markerGroups[Utils.TYPES.PICKUP].push(marker); // Set based on key value?
    };
    assignMarker[Utils.TYPES.DELIVERY] = function(marker) {
        marker.setIcon(Icons.deliveryIcon);
        markerGroups[Utils.TYPES.DELIVERY].push(marker);
    };
    assignMarker[Utils.TYPES.DRIVER] = function(marker) {
        marker.setIcon(Icons.driverIcon);
        markerGroups[Utils.TYPES.DRIVER].push(marker);
    };
    assignMarker[Utils.TYPES.RAMP] = function(marker) {
        marker.setIcon(Icons.rampIcon);
        markerGroups[Utils.TYPES.RAMP].push(marker);
    };
    assignMarker[Utils.TYPES.YARD] = function(marker) {
        marker.setIcon(Icons.yardIcon);
        markerGroups[Utils.TYPES.YARD].push(marker);
    };
    assignMarker[Utils.TYPES.TERMINAL] = function(marker) {
        marker.setIcon(Icons.hubIcon);
        markerGroups[Utils.TYPES.TERMINAL].push(marker);
    };
    assignMarker[Utils.TYPES.EQUIPMENT] = function(marker) {
        marker.setIcon(Icons.equipmentIcon);
        markerGroups[Utils.TYPES.EQUIPMENT].push(marker);
    };
    assignMarker[Utils.TYPES.RESERVATION] = function(marker) {
        marker.setIcon(Icons.reservationIcon);
        markerGroups[Utils.TYPES.RESERVATION].push(marker);
    };
    assignMarker[Utils.TYPES.DEPOT] = function(marker) {
        marker.setIcon(Icons.depotIcon);
        markerGroups[Utils.TYPES.DEPOT].push(marker);
    };
    assignMarker[Utils.TYPES.MULTI] = function(marker) {
        if(marker.number) {
          var _ = marker.number;
          (_ <= 100) ?  marker.setIcon(Icons.imagePath + 'symbols/number_'+ _ + '.png') : marker.setIcon(Icons.imagePath + 'symbols/letter_m.png');
        }
        markerGroups[Utils.TYPES.MULTI].push(marker);
    };
    
    // retrieve the lat/lng values from the address using geo services and build marker if possible
    function buildFromAddress(row) {
        if(!row) return;
        
        var loc = Geo.findLatLngWithRow(row);
        if(loc) {
            row.lat = loc.lat;
            row.lng = loc.lng;
            buildMarker(row);
        }
        else {
            console.debug('Could not build row: No lat / lng found');
        }
    }
    
    // ---------------------------------------------------- //
    // ---------------- TOGGLE FUNCTIONS ------------------ // 
    
    // toggleGroup is added to each of the filter select checkboxs on the UI as a client listener
    
    function toggleGroup(evt) {
        Filter.toggleGroup(evt, markerGroups);
    }
    
    function toggleAll(evt) {
        Filter.toggleAll(evt, markerGroups);
    }
    
    // ---------------------------------------------------- //
    // ---------------- CLEAR FUNCTIONS ------------------ // 
    
    function clearMarkerGroup(type) {
      if(!markerGroups.hasOwnProperty(type)) {
        console.debug('Cannot clear marker group. Type not found');
        return;
      }
      var group, j;
      group = markerGroups[type];
      for (j in group) {
         group[j].setMap(null);
      }
      if(group.length) group.splice(0, group.length);
    }
    
    function clearAllMarkers() {
      var i, j, group;
      for (var prop in markerGroups) {
            group = markerGroups[prop];
            for (j in group) {
               group[j].setMap(null);
            }
            if(group.length) group.splice(0, group.length);
      }
    }
    
    // ---------------------------------------------------- //
    // ---------------- Accessor FUNCTIONS ------------------ // 
    function getMarkers() {
      return markerGroups;
    }
    
    function findMarker(key, type) {
      if(!type) {
        return searchAllMarkers(key);
      }
      else {
        if(markerGroups.hasOwnProperty(type)) return searchByType(key, type);
        
        return searchAllMarkers(key);
      }
    }
    
    function searchAllMarkers(key) {
      var prop, group, i, _, closureBox;
        for(prop in markerGroups) {
        
          group = markerGroups[prop];
          
          if(prop === Utils.TYPES.MULTI) {
          
            for(i in group) {
            
              _ = group[i].key.some(function (e, i, arr) {
                  return (e === key);
              });
              
              if(_) return group[i];
              
            }
          }
          else {
          
            for(i in group) {
            
              if(group[i].key === key) return group[i];
              
            }
          }
        }
      return;
    }
    
    function searchByType(key, type) {
        var group = markerGroups[type];
        
        if(type === Utils.TYPES.MULTI) {
        
          for(var i in group) {
          
           var _ = group[i].key.some(function (e, i, arr) {
                return (e === key);
            });
            
            if(_) return group[i];
            
          }
        }
        else {
        
          for(var i in group) {
          
            if(group[i].key === key) return group[i];
            
          }
        }
      return;
    }
    
        // Return public members//
        // METHOD DESCRIPTION //
        // build is a method to construct the markers from the rows array and load images
        // refreshAllMarkers refreshes the map markers from the current data
        // setMap sets the map element in a style similar to the google maps API
        // getMarkers returns the markers object
        // find marker takes a key and optionally a type and returns the marker if found
    return {
            build: build,
            setMap : setMap,
            getMarkers : getMarkers,
            findMarker : findMarker,
            refreshEQMarkers : refreshEQMarkers,
            refreshDLMarkers : refreshDLMarkers,
            refreshPUMarkers : refreshPUMarkers,
            refreshDRMarkers : refreshDRMarkers,
            refreshAllMarkers : refreshAllMarkers
    }

});