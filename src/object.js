//Export object utils
export const object = {
    //Alias for Object.keys
    "keys": function (values) {
        return Object.keys(values);
    },
    //Get entries of the provided object
    //Ponyfill of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
    "entries": function (values) {
        return Object.keys(values).map(function (key) {
            return [key, values[key]];
        });
    },
    //Returns an array of a given object's own enumerable property values. 
    //Ponyfill of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    "values": function (values) {
        return Object.keys(values).map(function (key) {
            return values[key];
        });
    },
    //Object.freeze secure call
    "freeze": function (obj) {
        return (typeof Object.freeze === "function") ? Object.freeze(obj) : obj;
    }
};
