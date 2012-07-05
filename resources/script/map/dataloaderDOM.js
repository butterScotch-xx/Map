// The dataloader.js class returns an object which will return an array of rows from some data source. 
// Right now, the only data source I've written out is to look at the DOM and load from the ADF tables but we probably won't use that
// Will want to make AJAX calls to 
// TODO: Extend the loader to get data for map elements not in table (RAMPS, DEPOTS, Etc)

// The relative path for these files may change.
define(['utils/utils', 'utils/layout'], function(Utils, Layout) {


    // Will want to expand this later to read RAMPS, DEPOTS later

    function readRowsFromDOM() {
    	  var DOMrows = readDOMTables();
        return DOMrows;
    }

    // Needs to know about all the tables on the DOM
    // One would be to use the DashLayout Object saved in storage and have some logic which reads the pb's and infers what the tables should be
    // The second way is to just hardcode in a set number of id's to look for. 
    // There should be a Layout Object from layout.js

    function readDOMTables() {
        "use strict";
        var layout = Layout.readDOMLayout().slice(0, 4); // may want to call getLayout instead if already read by another function
        var tables = {
            PU: [],
            DE: [],
            EQ: [],
            DR: []
        };
        
        layout.forEach(findADFTables); // should populate the tables object with ADF table objects

        var rows = [];
        var outputIDs = ["lat", "lng", "addr", "city", "state", "zip", "key"]; // I just made these up. May not want to share across all methods
        
        populateRows(tables.PU, rows, outputIDs, 'PU');
        populateRows(tables.DE, rows, outputIDs, 'DE');
        populateRows(tables.EQ, rows, outputIDs, 'EQ');
        populateRows(tables.DR, rows, outputIDs, 'DR');
        
        return rows;
    }

    // Populates rows from ADF Tables
    // The id's will need to be verified and are temporary for now
    // Note that the output texts in the JSF need to have clientComponent = true
    // Also I've made thier id's match the row property names.

    function populateRows(adftables, rows, outputIDs, type) {
        var i, j, cell, rowCount, row;

        // Loop through tables and rows in the table
        for (i = 0; i < adftables.length; i++) {

            rowCount = adftables[i].getRows();

            for (j = 0; j < rowCount; j++) {

                row = {};
                ouputIDS.forEach(function(e, index, arr) {
                    cell = adftables[i].findComponent(e, j.toString());
                    (cell) ? row[e] = cell.getValue() : console.error('Cannot find cell handler for table : ' + adftables[i].getId() + " on row: " + j + " and column : " + e);
                });

                // Not sure how to distinguish between reservations / equipment yet. Perhaps check to see if ResID is filled in 
                row['type'] = type;
                rows.push(row);
            }
        }
    }

    // Requires an import of the utils object

    function findADFTables(col, i, arr) {
        "use strict";
        var id, t;
        for (var i = 0; i < col.length; i++) {
            if (col[i].id.match("pbDel")) {
                id = col[i].id + ':rDel:0:pc1:tDel'; // This id needs to be checked
                table = Utils.adfFind$(id);
                (table) ? tables.DE.push(table) : console.error('Del Table was not found');
            } else if (col[i].id.match("pbPick")) {
                tableIDs.PU.push(col[i].id + ':rPick:0:pc1:tPick'); // This id needs to be checked
                table = Utils.adfFind$(id);
                (table) ? tables.PU.push(table) : console.error('Pick Table was not found');
            } else if (col[i].id.match("pbEq")) {
                tableIDs.EQ.push(col[i].id + ':rEq:0:pc1:tEq'); // This id needs to be checked
                table = Utils.adfFind$(id);
                (table) ? tables.EQ.push(table) : console.error('Eq Table was not found');
            } else if (col[i].id.match("pbDriv")) {
                tableIDs.DR.push(col[i].id + ':rDriv:0:pc1:tDriv'); // This id needs to be checked
                table = Utils.adfFind$(id);
                (table) ? tables.DR.push(table) : console.error('Driv Table was not found');
            } else {
                console.error('An id was stored in the layout which is not recognized.');
            }
        }
    }

    // Return public members//
    // METHOD DESCRIPTION //
    // readRows returns an array of rows to be processed into markers
    // updateType is method TBD which will update the rows array only for the type specified (so we don't reread everything)
    return {
        readRowsFromDOM: readRowsFromDOM
    }

});
