//Check if the provided value is an object
export function isObject (value) {
    return typeof value === "object" && value !== null;
}

//Check if the provided value is an array
export function isArray (value) {
    return isObject(value) && Array.isArray(value);
}

//Check if the provided value is a function
export function isFunction (value) {
    return typeof value === "function";
}

//Check if the provided value is a string
export function isString (value) {
    return typeof value === "string";
}

//Get entries of the provided object
//Ponyfill of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
export function entries (obj) {
    return Object.keys(obj).map(function (key) {
        return [key, obj[key]];
    });
}

//Returns an array of a given object's own enumerable property values. 
//Ponyfill of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
export function values (obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

//Object.freeze secure call
export function freeze (obj) {
    return (typeof Object.freeze === "function") ? Object.freeze(obj) : obj;
}

//Export timeout wrapper
//Executes the callback at the provided timeout
//If no callback is provided, returns a promise that resolves at the given delay time
export function delay (timeout, callback) {
    //Check for callback method provided
    if (typeof callback === "function") {
        return setTimeout(callback, timeout);
    }
    //Otherwise: return a promise that resolves at the specified time
    return new Promise(function (resolve, reject) {
        return setTimeout(resolve, timeout);
    });
}

//Generates a unique random string of 15 chracters.
//tempid(); // -> "wv1ufiqj5e6xd3k"
export function tempid () {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// Returns a formatted timestamp. The `pattern` argument is a string where the following matches will be replaced:
// -`YYYY`: replaced with the current full year.
// - `MM`: replaced with the current month.
// - `DD`: replaced with the current day.
// - `hh`: replaced with the current hours.
// - `mm`: replaced with the current minutes.
// - `ss`: replaced with the current seconds.
//
// kofi.timestamp("Current year: YYYY")
// // -> "Current year: 2018"
///

//Available values
let timestampValues = ["YYYY", "MM", "DD", "hh", "mm", "ss"];

//Parse the provided pattern and return the wanted timestamp
export function timestamp (pattern, currentDate) {
    if (typeof pattern !== "string") {
        pattern = "YYYY-MM-DD hh:mm:ss";
    }
    let date = (typeof currentDate === "undefined") ? new Date() : currentDate;
    let result = {};
    let currentRegex = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).\d\d\dZ/g;
    let current = currentRegex.exec(date.toJSON());
    if (current === null || current.length < 7) {
        return pattern;
    }
    for (let i = 0; i < timestampValues.length; i++) {
        //The first element is the full matched string
        result[timestampValues[i]] = current[i + 1];
    }
    let regex = new RegExp("(" + timestampValues.join("|") + ")", "g");
    return pattern.replace(regex, function (match) {
        let value = result[match];
        while (value.length < match.length) {
            value = "0" + value;
        }
        return value;
        //return pad(result[match], match.length);
    });
}

//Map special chars to html codes
let htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "(": "&#40;",
    ")": "&#41;",
    "[": "&#91;",
    "]": "&#93;"
};

//Escape html >> converts '<', '>', '&', '"' and "'" chars to html codes
export function escape (unsafe) {
    return unsafe.replace(/[&<>"'()[\]]/g, function (match) {
        return htmlEscapes[match];
    });
}

// Replace all handlebars expressions from `str` with values of `obj`.
// format("My car is {{ color }}!", { color: 'blue' }); // --> "My car is blue!"
export function format (str, obj) {
    if (typeof obj === "undefined") { 
        return str; 
    }
    return str.replace(/\{\{([^{}]+)\}\}/g, function (match, found) {
        found = found.trim();
        if (typeof obj[found] !== "undefined") {
            return obj[found].toString();
        } else {
            return match;
        }
    });
}

