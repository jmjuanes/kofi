import {tempid} from "./helpers.js";

//Map special chars to html codes
let htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
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
    //Escape html >> converts '<', '>', '&', '"' and "'" chars to html codes
    "escape": function (unsafe) {
        return unsafe.replace(/[&<>"']/g, function (match) {
            return htmlEscapes[match];
        });
    },
    //Generates a unique random string of 15 chracters.
    "random": function () {
        return tempid();
    },
    // Replace all handlebars expressions from `str` with values of `obj`.
    // format("My car is {{ color }}!", { color: 'blue' }); // --> "My car is blue!"
    "format": function (str, obj) {
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
};

