// Async iterates over an `array` or an `object`.
// - `items`: `array` or `object` you want to iterate.
// - `fn`: function that will be called with each item of the `items` array or object with the following arguments: 
//   - First argument: the property name if `items` is an object, or the index if `items` is an array.
//   - Second argument: the property value if `items` is an object, or the value if `items` is an array.
//   - Last argument: a function to continue with the next item or to end the loop
// Returns: a new promise that resolves if all items has been processed, or rejects if the loop has finished at some point of the loop.
// You can stop the iteration by returning `false` in the iterator function
// Examples: 
// //Iterate over an array 
// each([1, 2, 3], function (index, value, next) {
//     console.log(index + " -> " + value);
//     return next();
// });
// // 0 -> 1
// // 1 -> 2
// // 2 -> 3
// 
// //Iterate over an object 
// let obj = {"key1": "value1", "key2": "value2"};
// each(obj, function (key, value, next) {
//     console.log(key + " -> " + value);
//     return next();
// });
// // key1 -> value1
// // key2 -> value2
export function each (items, fn) {
    if (typeof items !== "object" || items === null) {
        throw new Error("No array or object provided");
    }
    if (typeof fn !== "function") {
        throw new Error("No iterator function provided");
    }
    //Return the new each promise
    return new Promise(function (resolve, reject) {
        let isArray = Array.isArray(items);
        let keys = (isArray === true) ? {length: items.length} : Object.keys(items);
        //Iterate over each item
        let next = function (index) {
            if (index >= keys.length) {
                return resolve(); //End the each
            }
            //Get the current key
            let key = (isArray === true) ? index : keys[index];
            let value = items[key];
            return fn.call(null, key, value, function (error) {
                if (typeof error !== "undefined") {
                    return reject(error); //End the each loop
                }
                //Continue
                return next(index + 1);
            });
        };
        //Start the each loop
        return next(0);
    });
}


