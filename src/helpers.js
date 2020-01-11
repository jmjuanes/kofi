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

//Returns an array of a given object's own enumerable property values. 
//It's a ponyfill of the [`Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) method. 
export function values (obj) {
    return Object.keys(obj).map(function (key) { 
        return obj[key]; 
    });
}

//Object.freeze secure call
export function freeze (obj) {
    return (typeof Object.freeze === "function") ? Object.freeze(obj) : obj;
}

//Generates a unique random string of 15 chracters.
//tempid(); // -> "wv1ufiqj5e6xd3k"
export function tempid () {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

//Returns a new array with values starting in `start` to `end` (included). 
//You can specify the distance between each number in the sequence by providing a `step` value. Default `step` value is `1`.
//range(5); // -> [0, 1, 2, 3, 4, 5]
//range(0, 5); // -> [0, 1, 2, 3, 4, 5]
//range(0, 4, 2); // -> [0, 2, 4] 
export function range (start, end, step) {
    if (typeof start !== "number") {
        return []; //Calling without arguments returns an empty array
    }
    if (typeof end !== "number") {
        end = start;
        start = 0;
    }
    //Check if start < end and if start is not negative
    if (0 <= start && start < end) {
        if (typeof step !== "number") {
            step = 1; //Default step
        }
        if (step <= 0) {
            throw new Error("Step value must not be zero or negative");
        }
        let len = Math.floor((end - start) / step);
        return Array(len).fill().map(function (el, index) {
            return start + (index * step);
        });
    } else {
        //Start or end values not valid, return an empty array
        return [];
    }
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


