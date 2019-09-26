/**
 * @function reverse(str)
 * @description Returns the reverse string m of `str`.
 * @example
 * reverse("hello world");  
 * // -> "dlrow olleh"
 */

export default function reverse (str) {
    if (typeof str !== "string") {
        return str; 
    }
    return str.split("").reverse().join("");
}

