/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};


//Hàm kiểm tra email
function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

//hàm Guid validation
function isGuid(guid) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
}

function isNumeric(n) {
    var t = typeof n;
    return t == 'number' ? !isNaN(n) && isFinite(n) :
            t == 'string' ? !n.length ? false :
            n.length == 1 ? /\d/.test(n) :
        /^\s*[+-]?\s*(?:(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?)|(?:0x[a-f\d]+))\s*$/i.test(n) :
            t == 'object' ? !!n && typeof n.valueOf() == "number" && !(n instanceof Date) : false;
}

// Hàm đóng popup thông báo
function closeOverlay() {
    $('.topcoat-overlay-bg').hide();
    $('#loginOverlay').hide();
}

//Hàm hiển thị popup thông báo
function showOverlay() {
    $('.topcoat-overlay-bg').show();
    $('#loginOverlay').show();
}

//random guid
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


//formatDate

function xOfficeDateFormat(value) {
    value = value.trim();
    var splitDate = value.split(' ');
    if (splitDate.length > 0) {
        var dateValueConfig = splitDate[0];
        if (dateValueConfig.indexOf("/") !== -1) {
            var cleanDateArray = dateValueConfig.split('/');
            dateValueConfig = cleanDateArray[1] + "/" + cleanDateArray[0] + "/" + cleanDateArray[2];
            var dateTime = new Date(dateValueConfig);
            return dateTime.format("yyyy-mm-dd'T'HH:MM:ss");
        }
    }
    return (new Date()).format("yyyy-mm-dd'T'HH:MM:ss");
}

//formatDate for report param
function xFormatDate(value) {
    if (value != null && value != undefined) {
        value = value.trim();
        var splitDate = value.split(' ');
        if (splitDate.length > 0) {
            var dateValueConfig = splitDate[0];
            if (dateValueConfig.indexOf("/") !== -1) {
                var cleanDateArray = dateValueConfig.split('/');
                dateValueConfig = cleanDateArray[1] + "/" + cleanDateArray[0] + "/" + cleanDateArray[2];
                var dateTime = new Date(dateValueConfig);
                return dateTime.format("yyyy-mm-dd");
            }
        }
        return (new Date()).format("yyyy-mm-dd");
    } else {
        return null;
    }
}

//lấy startDate, endDate trong tuan

function getRangeDateInWeek() {
    var today = new Date(), curr = new Date();
    var first = curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -6 : 1);
    var startDate = new Date(curr.setDate(first));
    return { "StartDate": startDate.format("yyyy-mm-dd'T'00:00:00"), "EndDate": today.format("yyyy-mm-dd'T'HH:MM:ss") };
}

//lấy startDate, endDate trong tháng
function getRangeDateInMonth() {
    var now = new Date();
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { "StartDate": firstDay.format("yyyy-mm-dd'T'00:00:00"), "EndDate": now.format("yyyy-mm-dd'T'HH:MM:ss") };
}

//lấy startDate, endDate trong quý
function getRangeDateInQuarter() {
    var now = new Date();
    var quarter = Math.floor((now.getMonth() / 3));

    return {
        "StartDate": new Date(now.getFullYear(), quarter * 3, 1).format("yyyy-mm-dd'T'HH:MM:ss"),
        "EndDate": new Date(new Date(now.getFullYear(), quarter * 3, 1).getFullYear(), new Date(now.getFullYear(), quarter * 3, 1).getMonth() + 3, 0).format("yyyy-mm-dd'T'HH:MM:ss")
    };
}

//lấy startDate, endDate trong năm

function getRangeDateInYear() {
    var now = new Date();
    return {
        "StartDate": new Date(now.getFullYear(), 0, 1).format("yyyy-mm-dd"),
        "EndDate": new Date().format("yyyy-mm-dd") //ngay hom nay
    };
}

//lấy startDate, EndDate cách hiện tại 1 tháng
function getRangeDateOneMonthAgo() {
    var today = new Date();
    var priorDate = new Date().setDate(today.getDate() - 30);
    return {
        "EndDate": moment(today).subtract(10, 'days').calendar(),
        "StartDate": moment(priorDate).subtract(10, 'days').calendar()
    };
}

function readSettings(input) {
    var objSettings = {};
    if (typeof (input) == 'undefined' | input == null) return objSettings;

    input = input.trim();
    if (input.charAt(0) == "?") input = input.substr(1).trim();

    var lstSettings = input.split("&");
    for (var i = 0; i < lstSettings.length; i++) {
        var lstParam = lstSettings[i].split("=");
        if (lstParam.length >= 2) objSettings[lstParam[0].trim()] = lstParam[1].trim();
    }

    return objSettings;
}

/*--------Đăng xuất hệ thống-----------*/
function logout() {

    //Xóa tất cả từ localStorage
    clearStorage();
    window.location = "login.html";

}
function showDialogProfile() {
    $('#dialogProfile').toggle();
    console.log(localStorage.length);
}

//convert to in
function convetToInt(input) {

    try {
        if (input == null || input == undefined) return 0;
        var value = parseInt(input);
        if (isNaN(value)) return 0;
        else {
            return value;
        }
    } catch (e) {
        return 0;
    }
}

function convetToFloat(input) {

    try {
        if (input == null || input == undefined) return 0;
        return parseFloat(input);
    } catch (e) {
        return 0;
    }
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function isValidDate(d) {
    try {
        var t = new Date(d);
        return !isNaN(t.valueOf());
    }
    catch (e) {
        return false;
    }
}

function generateTypeData(type) {
    var typeOf = typeof type;
    if (typeOf == 'number') {
        return 1
    } else if (typeOf == 'string') {
        return 0
    } else if (typeOf == 'boolean') {
        return 2
    }
}

function setDefaultState(stateUrl){
    setItemLocalStorage('DefaultState', JSON.stringify(stateUrl));
};

function getDefaultState(){
    var _setting = JSON.parse(getItemLocalStorage('DefaultState'));
    return  _setting || {};
};