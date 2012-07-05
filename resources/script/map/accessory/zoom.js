// The zoom.js class manages the use of the zoom on the map by merging markers based on zoom leve
define(['utils/utils','utils/walksort', 'utils/filter'], function (Utils, WalkSort, Filter) {

    var map;
    var markerGroups; // shallow copy of markerGroups from markers.js
    var maxReach;
    
    // Sorted markers make collapse go O(n) instead of O(n^2)
    var sortedArray = [];
    
    // These were done my me by hand based off what I saw as reasonable
    var distThresh = {
      4: 100.0, 
      5: 35.0,
      6: 7.0,
      7: 5.0,
      8: 2.0,
      9: 1.0,
      10: 0.6,
      11: 0.3,
      12: 0.08,
      13: 0.08,
      14: 0.005,
      15: 0.005
    }
    
    // Sort is the main entry point for zoom. It takes a markerGroups object, copies it, and creates a sorted array from it.
    // Collapsing will not work without sorting first
    // @param groups gets deep copied and stored in the markerGroups variable
    function sort(groups) {
      markerGroups = jQuery.extend(true, {} ,groups);// Want to keep an unaltered version of the marker groups for reCollapse
      sortedArray = WalkSort.sortMarkers(markerGroups);
    }
    
    // Collapses the markers which are close enough together based on zoom level 
    // Don't care about differentiating zoom above 15 or below zoom 4
    // @param maxReach tells the collapse algo how far out to look in the sorted array
    function collapse(mxR) {
        if(!mxR) throw new Error('Max Reach must be set.')
        maxReach = mxR;
        return _collapse(sortedArray);
    }
    
    // internal collapse function
    // the collapse function takes a sorted array of markers which have been presolved for the traveling salesman problem
    // this enables us to search for closest points in O(n) time instead of O(n^2)
    // @param sArr is a sorted array of markers
    // @param reach tells the algo how far ahead of the sarr to look for close elements
    function _collapse(sArr) {
        var zoom = map.getZoom();
        var _sArr, len, dist, removeArray, i, _, reach, startElem, colCount;
        var reachState, collapseState, collapse;
        
        var groups = $.extend(true, {}, markerGroups);
        
        var state = Filter.getState();
        
        // Important : Speed issues for using .length on large arrays. Don't overcall by putting in loop
        // Will have to manually manage len
        len = sArr.length;
        _sArr = [];
        for(i = 0; i < len; i++) {
          _sArr[i] = i; // array of sArr's indecies. This is going to make dealing w/ sArr easier
        }
        
        for(i = 0; i < len; i++) {
          reach = 0;
          colCount = 0;
          startElem = sArr[_sArr[i]];
          removeArray = [];
          reachState = true, collapseState = false, collapse = false;
          
          while(true) {
            // Reach state: move along the list a distance maxReach out looking for elements to collapse
            while(reachState) {
            
              reach++;
              if(reach >= maxReach) {
                reachState = false;
                break;
              }
              
              _ = sArr[_sArr[i+reach+colCount]];
              
              if(!_) {
                reachState = false;
                break;
              } 
              // If the marker type does not want to be shown don't bother collapsing them
              if(state[_.marker.type]) {
                dist = Utils.approxDist(startElem.marker.getPosition(), _.marker.getPosition());
                
                if(isClose(dist, zoom)) {
                  reachState = false;
                  collapseState = true;
                }
              }
            }
            
            // While in collapse state don't increment reach just keep adding markers if close
            while(collapseState) {
              collapse = true;
              removeArray.push(_sArr[i+reach+colCount]);
              colCount++;
              
              _ = sArr[_sArr[i+reach+colCount]];
              if(!_) {
                collapseState = false;
                break;
              }
              // If the marker type does not want to be shown don't bother collapsing them
              if(state[_.marker.type]) {
                dist = Utils.approxDist(startElem.marker.getPosition(), _.marker.getPosition());
                
                if(!isClose(dist, zoom)) {
                  reachState = true;
                  collapseState = false;
                }
              }
              
            }
            
            // If not in either state then break from the loop
            if(!reachState && !collapseState) break;
            
          }
          
          if(collapse){
            len = mergeMarkers(len, startElem, removeArray, sArr, _sArr, groups);
          }
          
        }
        
        return groups;
    }
    
    function isClose(dist, zoom) {
       if(distThresh.hasOwnProperty(zoom)) thresh = distThresh[zoom];
       
       else if( zoom > 15 ) thresh = distThresh[15];
       
       else thresh = distThresh[4];
       
       return (dist < thresh);
    }
    
    function mergeMarkers(len, startElem, removeArray, sArr, _sArr, groups) {
      var multiMarker = new google.maps.Marker({
            title: "Multiple Elements Title"
          });
          
        // Open to other suggestions on how to get this data around w/ marker
        multiMarker.type = [];
        multiMarker.key = [];
        multiMarker.number = 0;
          
        var k = removeArray.length;
        while(k) {
            _ = sArr[removeArray[k-1]];
            multiMarker.key.push(_.marker.key);
            multiMarker.type.push(_.marker.type);
            multiMarker.number++;
        
            // Unset marker and remove from _sArr
            var groupIndex = groups[_.marker.type].indexOf(_.marker);
            (groupIndex !== -1) ? groups[_.marker.type].splice(groupIndex,1) : console.debug('A serious error has occured in zoom.js');
            _sArr.splice(_sArr.indexOf(removeArray[k-1]),1);
            len--;
            k--;
        }
        
        // Add the first element at the collapse position
        multiMarker.key.push(startElem.marker.key);
        multiMarker.type.push(startElem.marker.type);
        multiMarker.setPosition(startElem.marker.getPosition());
        multiMarker.number++;
        
        // Set the appropriate multi marker
        var imagePath = "../../resources/images/"; // Not sure how to get this from markers.js
        (multiMarker.number <= 100) ?  multiMarker.setIcon(imagePath + 'symbols/number_'+ multiMarker.number + '.png') : marker.setIcon(imagePath + 'symbols/letter_m.png');
        groups[Utils.TYPES.MULTI].push(multiMarker);
        
        // Unset marker from map and remove from groups
        var groupIndex = groups[startElem.marker.type].indexOf(startElem.marker);
        (groupIndex !== -1) ? groups[startElem.marker.type].splice(groupIndex,1) : console.debug('A serious error has occured in zoom.js');
        len--;
        
        return len;
    }
    

    // Attached to zoom change event
    // can only be called after collapsed has been called
    function reCollapse() {
      if(!maxReach) throw new Error('Must set maxReach in Zoom.collapse first');
      return _collapse(sortedArray);
    }

    // ---------------------------------------------------- //
    // ------------- Helper Management Functions ---------- // 
    
    function setMap(gmap) {
        map = gmap;
    }
    
    function getMarkers() {
      return markerGroups;
    }
    
    // PUBLIC METHODS
    // setMap in the manner of the google maps API
    // collapse reduces the marker groups by gourping markers close together
    // reCollapse is called by the zoom change event handler
    // sort - must be called before collapse on initial data load. 
    // getStoredMarkers returns the original representation of the marker Groups object before collapsing at current zoom level
    return {
        setMap : setMap,
        sort: sort,
        collapse : collapse,
        reCollapse : reCollapse,
        getStoredMarkers : getMarkers
    }
});