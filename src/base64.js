// convert a Unicode string to a string in which
// each 16-bit unit occupies only one byte
// source: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
let toBinary = function (string) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
};

let fromBinary = function (binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
};

//Base64 encode and decode https://tools.ietf.org/html/rfc4648#section-5
// Inspired in https://gist.github.com/jhurliman/1250118
export const base64 = {
    "encode": function (str) {
        return btoa(toBinary(str)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    },
    "decode": function (binary) {
        let str = binary.replace(/-/g, "+").replace(/_/g, "/");
        while (str.length % 4) {
            str = str + "="; //Add ending =
        }
        //Return base64 decoded url
        return fromBinary(atob(str));
    }
};


