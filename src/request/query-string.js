//Unescape
export function unescape(str) {
    return decodeURIComponent(str.replace(/\+/g, " "));
}

//Convert a query object to string
export function stringify(obj, del) {
    if (typeof obj !== "object") {
        return obj;
    }
    if (typeof del !== "string") {
        //Default delimiter
        del = "&";
    }
    let str = [];
    Object.keys(obj).forEach(function (key) {
        //Insert into the array
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
    });
    return str.join(del);
}

//Parse a query string
export function parse(str, del) {
    if (typeof str !== "string") {
        return {};
    }
    if (typeof del !== "string") {
        //Default delimiter
        del = "&";
    }
    let obj = {};
    str.trim().split(del).forEach(function (partial) {
        if (partial.trim() === "") {
            return;
        }
        let items = partial.trim().split("=");
        let itemKey = unescape(items[0]);
        let itemValue = (typeof items[1] === "string") ? unescape(items[1]) : "";

        //Check if value already exists in the parsed object
        if (typeof obj[itemKey] !== "undefined") {
            if (Array.isArray(obj[itemKey]) === false) {
                //Convert to array the current value
                obj[itemKey] = [obj[itemKey]];
            }
            obj[itemKey].push(itemValue);
        }
        else {
            obj[itemKey] = itemValue;
        }
    });
    return obj;
}
