// The js class returns an object which will return an array of rows from some data source. 
// Right now, the file is intended to only load from a UI component which is updated by a managed bean
// This is considered the best practice 
define(['utils/utils'], function (Utils) {

    var data = {
    };

    function loadData() {
        data[Utils.TYPES.PICKUP] = loadPickupData() || [];// Pickup
        data[Utils.TYPES.DELIVERY] = loadDeliveryData() || [];// Delivery
        data[Utils.TYPES.DRIVER] = loadDriverData() || [];// Driver
        data[Utils.TYPES.RAMP] = loadRampData() || [];// Ramp (how are we going to get these locations?)
        data[Utils.TYPES.YARD] = loadYardData() || [];// Yard (how are we going to get these locations?)
        data[Utils.TYPES.EQUIPMENT] = loadEquipData() || [];// Equipment
        data[Utils.TYPES.DEPOT] = loadDepotData() || [];// Depot (how are we going to get these locations?)
        data[Utils.TYPES.TERMINAL] = loadTerminalData() || [];// Terminal (how are we going to get these locations?)
        return data;
    }

    function refreshData() {
        data[Utils.TYPES.PICKUP] = loadPickupData() || [];// Pickup
        data[Utils.TYPES.DELIVERY] = loadDeliveryData() || [];// Delivery
        data[Utils.TYPES.DRIVER] = loadDriverData() || [];// Driver
        data[Utils.TYPES.EQUIPMENT] = loadEquipData() || [];// Equipment
        return data;
    }

    function loadEquipData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapEQData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadEquipData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadDriverData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapDriverData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadDriverData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadPickupData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapPickupData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadPickupData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadDeliveryData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapDeliveryData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadDeliveryData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadRampData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapRampData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadRampData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadTerminalData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapTerminalData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadTerminalData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadDepotData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapDepotData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadDepotData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    function loadYardData() {
        "use strict";
        var comp = Utils.adfFind$(mapPrefix + "mapYardData");
        if (comp)
            var data = comp.getValue();
        if (!data) {
            console.debug('No data was loaded by loadYardData');
            return;
        }
        data = JSON.parse(data);
        return data;
    }

    // Public methods
    // loadEquipData returns equipment map rows from UI component
    // loadDriverData returns driver map rows from UI component
    // loadPickupdata returns pickup map rows from UI component
    // loadDeliverydata returns delivery map rows from UI component
    // loadTerminalData returns terminal map rows from UI component
    // loadDepotData returns depot map rows from UI component
    // loadYardData returns yard map rows from UI component
    // loadData loads all data
    // returns the full data object 
    return {
        loadDepotData : loadDepotData,
        loadTerminalData : loadTerminalData,
        loadEquipData : loadEquipData,
        loadRampData : loadRampData,
        loadDeliveryData : loadDeliveryData,
        loadPickupData : loadPickupData,
        loadDriverData : loadDriverData,
        loadYardData : loadYardData,
        loadData : loadData,
        refreshData : refreshData,
        data : data
    }

});// end of module