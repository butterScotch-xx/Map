// The layout.js file returns an object which reads / write to the local storage in the browser 
// and stores the information in a local object. Responsibily for updating when the user uses
// dnd.js or resize.js and save the information accordingly will be deligated to those files

define(['utils'], function (Utils) {

    var modifier = "Layout";
    var adfPrefix = "pt1:";
    var DashLayout = [[], [], [], [], 
    {
        name : (getPageName() + modifier)
    }
];
    var dend = DashLayout.length - 1;
    var storage = window.localStorage;
    if (!storage) {
        throw new Error('Unable to access local storage');
    }

    function getLayout() {
        return DashLayout;
    }

    function saveToStorage() {
        storage.setItem(DashLayout[dend].name, JSON.stringify(DashLayout));
    }

    function getFromStorage() {
        var a = storage.getItem(DashLayout[dend].name);
        if (a) {
            return JSON.parse(a);
        }
    }

    function readDOMLayout() {
        var cols;

        // Assign a page ID
        DashLayout[dend].name = getPageName() + modifier;

        // Set the page layout   
        cols = [];
        // TODO : Change this to Utils.find$ when moved to modular script
        cols.push(document.getElementById(adfPrefix + 'column_1') || 'column_1'); 
        cols.push(document.getElementById(adfPrefix + 'column_2') || 'column_2');
        cols.push(document.getElementById(adfPrefix + 'column_3') || 'column_3');
        cols.push(document.getElementById(adfPrefix + 'column_4') || 'column_4');

        cols.forEach(mapChildren);

        return DashLayout;
    }

    function mapChildren(elem, index, array) {
        if (typeof elem === 'string') {
            return;
        }
        Array.prototype.slice.apply(elem.children).forEach(function (e, j, arr) {
            DashLayout[index][j] = {
                id : e.children[0].id, height : (parseInt(e.children[0].style.height, 10) || "")
            };
        });
    }

    function getPageName() {
        page = window.location.pathname;// Full path from root
        page = page.substring(page.lastIndexOf('/') + 1);// Just the page name
        return page;
    }

    // Need to think about what do do when elems aren't found
    function adjustDOM(e, se, c) {
        var elem;
        for (var j = 0;j < e.length;j++) {
            if (!se[j]) {
                elem = document.getElementById(e[j].id);
                c.appendChild(elem.parentElement);
            }
            else {
                handleInsert(e[j].id, se[j].id, c, j);
            }
        }
    }

    // TODO: Add ADF elements to partial targets
    function handleInsert(eid, sid, c, j) {
        if (eid !== sid) {
            elem = document.getElementById(eid);
            if (!elem) {
                console.error('A dashboard element was saved to the layout object but not found in the DOM');
            }
            else {
                selem = c.children[j];
                c.insertBefore(elem.parentElement, selem);
            }
        }
    }

    // Initialize function which will be called on page load. It will reach out to the storage 
    // for a layout object and initialize from that state or read the DOM and save current state
    function init() {
        var layout = getFromStorage();
        if (!layout) {
            layout = readDOMLayout();
            saveToStorage();
            return;
        }

        // Cycle through the layout making DOM reordering as necissary
        var i, col, DOMLayout;
        DOMLayout = readDOMLayout().slice(0, 4);// just the arrays
        layout = layout.slice(0, 4);// just the arrays
        for (i = 0;i < 4;i++) {
            col = document.getElementById(adfPrefix + 'column_' + (i + 1));
            adjustDOM(layout[i], DOMLayout[i], col);
        }
    }

    // Return public members//
    // METHOD DESCRIPTION //
    // readDOMLayout reads the current DOM structure and returns the layout in DashLayout
    // getLayout returns the currently stored DashLayout without reading the DOM or session
    // saveToStorage saves the currently stored DashLayout to sessionStorage
    // getFromStorage returns the DashLayout saved in sessionStorage
    return {
        readDOMLayout : readDOMLayout, getLayout : getLayout, saveToStorage : saveToStorage, getFromStorage : getFromStorage
    }

});// end of module