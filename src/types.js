import {tempid, format, escape} from "./helpers.js";
import {entries, values, freeze} from "./helpers.js";

//Export JSON utils
export const json = {
    "encode": JSON.stringify,
    "decode": JSON.parse
};

//Export object utils
export const object = {
    //Alias for Object.keys
    "keys": function (values) {
        return Object.keys(values);
    },
    //Other object utils available in helpers
    "entries": entries,
    "values": values,
    "freeze": freeze
};

//Export string utils
export const string = {
    //Capitalize an string
    "capitalize": function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    //Check if a string starts with the specified substring
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
    "startsWith": function (str, search) {
        return search.length <= str.length && str.substring(0, search.length) === search;
    },
    //Check if a string ends with the speficied substring
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
    "endsWith": function (str, search) {
        return search.length <= str.length && str.substring(str.length - search.length, str.length) === search;
    },
    //Other utils available in helpers
    "escape": escape,
    "random": tempid,
    "format": format
};


