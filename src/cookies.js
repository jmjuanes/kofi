// Get a cookie by name
const getCookie = (name) => {
    const match = document.cookie.match(`(?:(?:^|.*; *)${name} *= *([^;]*).*$)|^.*$`);
    return match[1] ? decodeURIComponent(match[1]) : null;
};

// Set a cookie
const setCookie = (name, value, options) => {
    options = options || {};
    const cookieContent = [name + "=" + encodeURIComponent(value)];
    Object.keys(options).forEach(key => {
        if (key === "secure") {
            return cookieContent.push("secure"); //Add secure option
        }
        // Expiration date
        if (key === "expires") {
            return cookieContent.push(`expires=${new Date(options.expires).toUTCString()}`);
        }
        //Default --> set the cookie option value
        cookieContent.push(`${key}=${options[key]}`);
    });
    //Save the new cookie
    document.cookie = cookieContent.join("; ");
};

// Cookies manager
export const cookies = {
    "get": getCookie,
    "set": setCookie,
    "remove": (name, options) => {
        return setCookie(name, "", Object.assign(options, {
            "expires": (-1) * 60 * 60 * 24
        }));
    },
};
