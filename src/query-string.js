//Unescape
let unescape = function (str) {
    return decodeURIComponent(str.replace(/\+/g, " "));
};

//Convert an object to query-string
export function buildQueryString (obj, delimiter) {
    if (typeof obj !== "object" || obj === null) {
        return ""; //No object provided --> return an empty string
    }
    if (typeof delimiter !== "string") {
        delimiter = "&"; //Default delimiter
    }
    let items = [];
    Object.keys(obj).forEach(function (key) {
        const item = (Array.isArray(obj[key]) === true) ? obj[key] : [obj[key]];
        item.forEach(function (value) {
            items.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        });
    });
    return items.join(delimiter);
}

//Parse a query string to object
export function parseQueryString (str, delimiter) {
    if (typeof str !== "string") {
        return {}; //No querystring provided --> return empty object
    }
    if (typeof delimiter !== "string") {
        delimiter = "&";
    }
    let obj = {};
    //Split by delimiter
    str.trim().replace(/^\?/, "").split(delimiter).forEach(function (item) {
        if (item.trim() !== "") {
            let items = item.trim().split("=");
            let itemKey = unescape(items[0]);
            let itemValue = (typeof items[1] === "string") ? unescape(items[1]) : "";
            //Check if value exists in the parsed object
            if (typeof obj[itemKey] !== "undefined") {
                if (Array.isArray(obj[itemKey]) === false) {
                    obj[itemKey] = [obj[itemKey]];  //Convert to array
                }
                obj[itemKey].push(itemValue); //Insert this value
            }
            else {
                obj[itemKey] = itemValue;
            }
        }
    });
    return obj;
}

//Query string parser/encoder
export const qs = {
    "encode": buildQueryString,
    "decode": parseQueryString
};

