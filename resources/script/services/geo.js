// The geo.js class returns an object which will handle all geolocation services

define(['utils/utils'], function(Utils) {

    function findLatLng(address) {
    	 "use strict";
        return goecodeAddress(address);
    }


    // Finds  the lat lng for a row basd on address stored on row

    function findLatLngWithRow(row) {
        "use strict"
        var addr, city, state, zip,
            address = "";

        if (row["address"]) {
            addr = row["address"];
            city = row["city"];
            state = row["state"];
            zip = row["zip"];
            address += addr + "," + city + "," + state + " " + zip;
            console.log("Address lookup : " + address)
        }

        return geocodeAddressWithRow(address, row);
    }

    function geocodeAddress(address, row) {
        "use strict";
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                setTimeout(geocodeAddress, 100); // Function calls itself with slight delay
            } else if (status == google.maps.GeocoderStatus.OK) {
                var loc = results[0].geometry.location;
                return {
                    lat: loc.lat(),
                    lng: loc.lng()
                };
            } else {
                console.debug("Address not found.");
                return;
            }
        });
    }

    function geocodeAddressWithRow(address, row) {
        "use strict";
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                setTimeout(geocodeAddressWithRow, 100); // Function calls itself with slight delay
            } else if (status == google.maps.GeocoderStatus.OK) {
                var loc = results[0].geometry.location;
                return {
                    lat: loc.lat(),
                    lng: loc.lng()
                };
            } else {
            	// Could store list of known failures in localStorage
                var attempt = row.getAttribute("attempt");
                if (!attempt) {
                    row['address'] = "";
                    row.setAttribute("attempt", 1);
                    findLatLngWithRow(row);
                } else if (attempt == 1) {
                    row.setAttribute("zip", "");
                    row.setAttribute("attempt", attempt + 1);
                    findLatLngWithRow(row);
                } else {
                    console.debug("Address not found.");
                    return;
                }
            }
        
        });
	}

	// Public Methods
	// findLatLng takes an address string and returns a lat/lng object
	// buildFromAddress takes a row and builds 
	return {
		findLatLng : findLatLng, findLatLngWithRow : findLatLngWithRow
	}
})
