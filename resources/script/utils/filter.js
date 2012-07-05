// The filter.js class manages the 'state' of the map in terms of what types of markers to show
// could be extended in the future for more complex filtering

define(['utils/utils'], function (Utils) {

    var filterState = {};
    var map;
    
    function init (gmap) {
      if(!gmap) console.error('Must set map on filter object');
      map = gmap;
      filterState[Utils.TYPES.DELIVERY] = setState(Utils.TYPES.DELIVERY);
      filterState[Utils.TYPES.PICKUP] = setState(Utils.TYPES.PICKUP);
      filterState[Utils.TYPES.EQUIPMENT] = setState(Utils.TYPES.EQUIPMENT);
      filterState[Utils.TYPES.DRIVER] = setState(Utils.TYPES.DRIVER);
      filterState[Utils.TYPES.RAMP] = setState(Utils.TYPES.RAMP);
      filterState[Utils.TYPES.DEPOT] = setState(Utils.TYPES.DEPOT);
      filterState[Utils.TYPES.RESERVATION] = setState(Utils.TYPES.RESERVATION);
      filterState[Utils.TYPES.YARD] = setState(Utils.TYPES.YARD);
      filterState[Utils.TYPES.TERMINAL] = true;
      filterState[Utils.TYPES.MULTI] = true;
      
    }
    
    function setState(type) {
      var comp = Utils.adfFind$(mapPrefix + type.toLowerCase() + "Chk");
      return (comp) ? comp.getValue() : console.error('Cannot find checkbox');
    }
    
    function getState() {
      return filterState;
    }
    // ---------------------------------------------------- //
    // ---------------- TOGGLE FUNCTIONS ------------------ // 
    
    // toggleGroup is added to each of the filter select checkboxs on the UI as a client listener
    
    function toggleGroup(evt, markerGroups) {
        "use strict";
        window.src = evt.getSource();
        var src = evt.getSource();
        toggle(src, markerGroups);
    }
    
    // Toggle relies on the ID of the source element to begin with the letter associated with the marker group
    // val is a boolean representing the state of the checkbox
    
    function toggle(src, markerGroups) {
        "use strict";
        var val, id, type, group, i;
        val = src.getValue();
        id = src.getId();
        type = id.substring(0, 2).toUpperCase();
        
        if(!markerGroups.hasOwnProperty(type)) console.error('Cannot find toggle type.');
        filterState[type] = val;
        group = markerGroups[type];
        for (i in group) {
            (val) ? group[i].setMap(map) : group[i].setMap(null);
        }
    }
    
    // See toggle
    
    function toggleAll(evt, markerGroups) {
        "use strict";
        var src, val, i, group, j;
        src = evt.getSource();
        val = src.getValue();
        for (i in markerGroups) {
            group = markerGroups[i];
            for (j in group) {
                (val) ? group[j].setMap(map) : group[j].setMap(null);
            }
        }
    }

  // PUBLIC FUNCTIONS
  // toggleAll
  // toggleGroup
  // init intializes the state of the filter
  // getState returns the filter state
  return {
    toggleAll : toggleAll,
    toggleGroup : toggleGroup,
    init : init,
    getState : getState
  }
});