//Get a value of a cookie
export function getCookie (name) {
    let match = document.cookie.match(`(?:(?:^|.*; *)${name} *= *([^;]*).*$)|^.*$`);
    if (typeof match[1] !== "undefined") {
        return decodeURIComponent(match[1]); // Decode and return the matched value
    }
    //Default, cookie not found --> return null
    return null;
}

//Set a new cookie with the given value and options
export function setCookie (name, value, options) {
    if (typeof options !== "object" || options === null) {
        options = {};
    }
    //Build the cokie content
    let cookieContent = [name + "=" + encodeURIComponent(value)];
    Object.keys(options).forEach(function (key) {
        if (key === "secure") {
            cookieContent.push("secure"); //Add secure option
        }
        else if (key === "expires") {
            //Add the expiration date
            cookieContent.push(`expires=${new Date(options.expires).toUTCString()}`);
        }
        else {
            //Default --> set the cookie option value
            cookieContent.push(`${key}=${options[key]}`);
        }
    });
    //Save the new cookie
    document.cookie = cookieContent.join("; ");
}

//Delete a cookie
export function deleteCookie (name, options) {
    return setCookie(name, "", Object.assign(options, {
        "expires": (-1) * 60 * 60 * 24
    }));
}

