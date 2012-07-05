// The utils class exposes a serious of functions which I find useful throughout the ADF JS application
define([], function () {
    Utils = {
        TYPES :  {
            MULTI : 'MU', PICKUP : 'PU', DELIVERY : 'DL', EQUIPMENT : 'EQ', DRIVER : 'DR', RESERVATION : 'RE', YARD : 'YA', RAMP : 'RA', DEPOT : 'DE', TERMINAL : 'TE'
        },
        permute : function (nTimes, indexArray) {
            "use strict";
            if (!Array.isArray(indexArray) || typeof nTimes !== 'number') {
                throw new Error('Incorrect input types');
            }
            var i, j, t, n;
            indexArray = indexArray || [];

            for (n = 0;n < nTimes;n++) {
                i = randomInt(indexArray.length);
                j = randomInt(indexArray.length);
                if (i !== j) {
                    t = indexArray[i];
                    indexArray[i] = indexArray[j];
                    indexArray[j] = t;
                }
            }

            return indexArray;
        },
        // Takes two google maps LatLng objects
        // takes around .0016 ms per call so don't do more than 100,000
        // Equirectangular approximation
        approxDist : function (pos1, pos2) {
            var R = 6371;// km (used in approxDist)
            var lat1 = toRad(pos1.lat());
            var lat2 = toRad(pos2.lat());
            var lng1 = toRad(pos1.lng());
            var lng2 = toRad(pos2.lng());
            var x = (lng2 - lng1) * Math.cos((lat1 + lat2) / 2);
            var y = (lat2 - lat1);
            return Math.sqrt(x * x + y * y) * R;
        },
        hookEvent : function (element, eventName, callback) {
            if (!element)
                return;
            if (typeof (element) == "string")
                element = document.getElementById(element);
            if (element.addEventListener)
                element.addEventListener(eventName, callback, false);
            else if (element.attachEvent)
                element.attachEvent("on" + eventName, callback);
        },
        unhookEvent : function (element, eventName, callback) {
            if (typeof (element) == "string")
                element = document.getElementById(element);
            if (!element)
                return;
            if (element.removeEventListener)
                element.removeEventListener(eventName, callback, false);
            else if (element.detachEvent)
                element.detachEvent("on" + eventName, callback);
        },
        cancelEvent : function (e) {
            e = e ? e : window.event;
            if (e.stopPropagation)
                e.stopPropagation();
            if (e.preventDefault)
                e.preventDefault();
            e.cancelBubble = true;
            e.cancel = true;
            e.returnValue = false;
            return false;
        },
        getEventTarget : function (e) {
            e = e ? e : window.event;
            return e.target ? e.target : e.srcElement;
        },

        // Helper function
        pausecomp : function (ms) {
            ms += new Date().getTime();
            while (new Date() < ms) {
            }
        },
        getOffset : function (elem) {
            var _x = 0;
            var _y = 0;
            while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
                _x += elem.offsetLeft - elem.scrollLeft;
                _y += elem.offsetTop - elem.scrollTop;
                elem = elem.offsetParent;
            }
            return {
                top : _y, left : _x
            };
        },
         Position : function (x, y) {
            this.X = x;
            this.Y = y;

            this.Add = function (val) {
                var newPos = new Utils.Position(this.X, this.Y);
                if (val != null) {
                    if (!isNaN(val.X))
                    newPos.X += val.X;
                    if (!isNaN(val.Y))
                    newPos.Y += val.Y
                }
                return newPos;
            }

            this.Subtract = function (val) {
                var newPos = new Utils.Position(this.X, this.Y);
                if (val != null) {
                    if (!isNaN(val.X))
                    newPos.X -= val.X;
                    if (!isNaN(val.Y))
                    newPos.Y -= val.Y
                }
                return newPos;
            }

            this.Min = function (val) {
                var newPos = new Utils.Position(this.X, this.Y)
                if (val == null)
                return newPos;

                if (!isNaN(val.X) && this.X > val.X)
                newPos.X = val.X;
                if (!isNaN(val.Y) && this.Y > val.Y)
                newPos.Y = val.Y;

                return newPos;
            }

            this.Max = function (val) {
                var newPos = new Utils.Position(this.X, this.Y)
                if (val == null)
                return newPos;

                if (!isNaN(val.X) && this.X < val.X)
                newPos.X = val.X;
                if (!isNaN(val.Y) && this.Y < val.Y)
                newPos.Y = val.Y;

                return newPos;
            }

            this.Bound = function (lower, upper) {
                var newPos = this.Max(lower);
                return newPos.Min(upper);
            }

            this.Check = function () {
                var newPos = new Utils.Position(this.X, this.Y);
                if (isNaN(newPos.X))
                newPos.X = 0;
                if (isNaN(newPos.Y))
                newPos.Y = 0;
                return newPos;
            }

            this.Apply = function (element) {
                if (typeof (element) == "string")
                element = document.getElementById(element);
                if (element == null)
                return;
                if (!isNaN(this.X))
                element.style.left = this.X + 'px';
                if (!isNaN(this.Y))
                element.style.top = this.Y + 'px';
            }
        },
        absoluteCursorPostion : function (eventObj) {
            eventObj = eventObj ? eventObj : window.event;

            if (isNaN(window.scrollX))
            return new this.Position(eventObj.clientX + document.documentElement.scrollLeft + document.body.scrollLeft, eventObj.clientY + document.documentElement.scrollTop + document.body.scrollTop);
            else 
            return new this.Position(eventObj.clientX + window.scrollX, eventObj.clientY + window.scrollY);
        },
        // I use $ to indicate the function is just an abreviation for another function 
        // and does not call any additional code besides type checking
        find$ : function (id) {
            if (typeof id !== 'string') {
                console.error('Must pass string');
                return;
            }
            return document.getElementById(id);
        },
        adfFind$ : function (id) {
            if (typeof id !== 'string') {
                console.error('Must pass string');
                return;
            }
            return AdfPage.PAGE.findComponent(id);
        },
        target$ : function (elem) {
            if (typeof elem !== 'object') {
                console.error('Must pass Object to partial targets')
                return;
            }
            return AdfPage.PAGE.findComponent(elem);
        },
        makeArray$ : function (obj) {
            return Array.prototype.slice.apply(obj);
        },

        // Merges two arrays through a function sort of like map
        merge : function (func, arr1, arr2) {
            "use strict";
            if (!Array.isArray(arr1) || !Array.isArray(arr2) || typeof func !== 'function') {
                console.debug('Not arrays or function');
                return;
            }
            if (arr1.length !== arr2.length) {
                console.debug('Array lengths dont match');
                return;
            }
            var r = [];
            for (var i = 0, len = arr1.length;i < len;i++) {
                r.push(func(arr1[i], arr2[i]));
            }
            return r;
        },

        // Expands two arrays through a function and returns array of length MxN
        expand : function (func, arr1, arr2) {
            "use strict";
            if (!Array.isArray(arr1) || !Array.isArray(arr2) || typeof func !== 'function') {
                console.error('Not arrays or function');
                return;
            }
            var r = [];
            for (var i = 0, len = arr1.length;i < len;i++) {
                for (var j = 0, len2 = arr2.length;j < len2;j++) {
                    r.push(func(arr1[i], arr2[j]));
                }
            }
            return r;
        }
    }

    randomInt = function (int) {
        return Math.floor(Math.random() * (int));
    }
    toRad = function (pos) {
        return (Math.PI * pos) / 180;
    }

    return Utils;
});// end of module