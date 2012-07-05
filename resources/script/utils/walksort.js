// The walksort.js class was created to assist the use of the zoom on the map by sorting markers by their proximity to eachother
// so that the zoom collapse function would run O(n) instead of O(n^2)
define(['utils/utils'], function (Utils) {

    var lookDistance;
    var markerGroups;
    // ---------------------------------------------------- //
    // ------------ Sorting Management Functions ---------- // 
    // going to want the sorting done asynchronously using setTimout
    function sortMarkers(_groups, _distance) {

        lookDistance = _distance;
        markerGroups = _groups;

        var unsortedArray = [];
        for (var type in markerGroups) {
            unsortedArray = unsortedArray.concat(markerGroups[type].map(returnUnsortElem)); // rock hard FP
        }
        unsortedArray.forEach(addSortIndex);

        // This pain is to keep the sortedLat/Lng arrays dereferenced from eachother otherwise sort will 
        // affet both
        var sortedLatArray = $.extend(true, [], unsortedArray).sort(sortLat);
        var sortedLngArray = $.extend(true, [], unsortedArray).sort(sortLng);

        // Store the index's of the stored elements since we don't need
        var indexLatSorted = [];
        var indexLngSorted = [];
        for (var i = 0; i < sortedLatArray.length; i++) {
            indexLatSorted.push(sortedLatArray[i].sortIndex);
            indexLngSorted.push(sortedLngArray[i].sortIndex);
        }

        //unsortedArray = Utils.permute(unsortedArray.length,unsortedArray); Used only for testing
        return walkSort(indexLngSorted, indexLatSorted, unsortedArray, lookDistance);

    }

    // There should be some discussion over how far the lookDistance should be.
    // We should determine how many elements the average user is going to be seeing on their screen
    // along with how much time is reasonable to sort.
    function walkSort(indexLatSorted, indexLngSorted, unsortedArray, lookDistance) {
        var sortedArray = [];
        var index, secIndex, choice, startElem;
        var holderTypeIndex = [];
        var choices_1 = []
        var choices_2 = [];

        // Too many index's this is impossible to read
        index = 0;
        while (true) {
            choices_1 = [];
            choices_2 = [];

            startElem = unsortedArray[indexLatSorted[index]];

            for (var i = -lookDistance; i <= lookDistance; i++) {
                if (i !== 0 && index + i >= 0) {
                    choices_1[i] = (index + i < indexLatSorted.length - 1) ? unsortedArray[indexLatSorted[index + i]] : undefined;
                }
            }

            secIndex = indexLngSorted.indexOf(indexLatSorted[index]);
            for (i = -lookDistance; i <= lookDistance; i++) {
                if (i !== 0 && secIndex + i >= 0) {
                    choices_2[i] = (secIndex + i < indexLngSorted.length - 1) ? unsortedArray[indexLngSorted[secIndex + i]] : undefined;
                }
            }

            choice = choose(choices_1, choices_2, startElem, lookDistance);

            // Remove start element from sorted arrays and place in holder array
            holderTypeIndex.push(getHolder(startElem));
            indexLatSorted.splice(index, 1);
            indexLngSorted.splice(secIndex, 1);


            if (indexLatSorted.length === 1) {
                break;
            }

            if (choice.choiceGroup === 1) {
                i = parseInt(choice.i, 10);
                index = (i < 0) ? index + i : index + i - 1;
            } else if (choice.choiceGroup === 2) {
                i = parseInt(choice.i, 10);
                index = (i < 0) ? indexLatSorted.indexOf(indexLngSorted[secIndex + i]) : indexLatSorted.indexOf(indexLngSorted[secIndex + i - 1]);
            }
            if (index === -1) console.error('The next element was not found');

        }
        holderTypeIndex.push(getHolder(unsortedArray[indexLatSorted[0]])); // add the last element

        holderTypeIndex.forEach(function (e, j, arr) {
            e.marker = markerGroups[e.type][e.index];
            sortedArray.push(e);
        });

        return sortedArray;
    }

    // Choose the closest element to the start element by distance
    function choose(choices_1, choices_2, startElem, lookDistance) {

        var bestDist = 1000000000;
        var choiceGroup = 0;
        var bestI;
        for (var i = -lookDistance; i <= lookDistance; i++) {
            _ = choices_1[i];
            if (_) {
                dist_ = Utils.approxDist(startElem.pos, _.pos);
                if (bestDist >= dist_) {
                    bestDist = dist_;
                    bestI = i;
                    choiceGroup = 1;
                }
            }
        }

        for (i = -lookDistance; i <= lookDistance; i++) {
            _ = choices_2[i];
            if (_) {
                dist_ = Utils.approxDist(startElem.pos, _.pos);
                if (bestDist > dist_) {
                    bestDist = dist_;
                    bestI = i;
                    choiceGroup = 2;
                }
            }
        }

        return {
            i: bestI,
            choiceGroup: choiceGroup
        };
    }

    function getHolder(elem) {
        return {
            index: elem.index,
            type: elem.type
        }
    }

    function returnUnsortElem(e, i, arr) {
        return {
            pos: e.getPosition(),
            index: i,
            type: e.type
        };
    }

    function sortLat(a, b) {
        return (a.pos.lat() - b.pos.lat());
    }

    function sortLng(a, b) {
        return (a.pos.lng() - b.pos.lng());
    }

    function addSortIndex(e, i, arr) {
        e.sortIndex = i;
    }

    // PUBLIC METHODS
    // sortMarkers takes the markerGroups object and returns it sorted approx by lookDistance
    // walk sort is the actual sorting mechanism itself
    return {
        sortMarkers: sortMarkers,
        walkSort: walkSort
    }
}); // end of module