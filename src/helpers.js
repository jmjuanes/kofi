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


