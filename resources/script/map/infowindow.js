// The infowindow.js class returns an object which will construct and manage the infowindow 
// NOTE: BuildMarker function not yet implemented
define(["utils/utils"], function (Utils) {

    var windowOptions = {
        maxWidth: 20
    };
    var infowindow = new google.maps.InfoWindow(windowOptions);

    function open(map, marker) {
        infowindow.setContent('<img src="../../resources/images/load_animation.gif" class="blackLoader" /><strong> Loading ' + marker.key + ' ...</strong>')
        infowindow.open(map, marker);
        if (jQuery) $('.blackLoader').fadeIn(1000, function () {});

        // Adf AJAX call
        var _ = Utils.adfFind$(mapPrefix + 'mapWindowData'); // ADF requires a component be sent back
        if (Array.isArray(marker.type)) {
            params = {
                rowType: JSON.stringify(marker.type), // The Geniuses at Oracle made this silently fail if you pass a property called type. 
                key: JSON.stringify(marker.key)
            }
        } else {
            params = {
                rowType: marker.type, // The Geniuses at Oracle made this silently fail if you pass a property called type. 
                key: marker.key
            };
        }
        AdfCustomEvent.queue(_, "infoWindowRequest", params, false);
    }

    // Attached Listener for INFOWINDOW DATA CHANGE
    // TODO: Finish this method with real return values / content display
    function loadContent() {
        "use strict";
        var comp, data;
        comp = Utils.adfFind$(mapPrefix + 'mapWindowData');
        if (comp) data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadEquipData');
            return;
        }
        data = JSON.parse(data);
        infowindow.setContent('Type : ' + data.type + ' ; ' + 'Key ' + data.key);
    }

    // PUBLIC METHODS
    // Open exposes infowindow.open but with server AJAX to load content
    return {
        loadContent: loadContent,
        open: open
    }
}); // end module