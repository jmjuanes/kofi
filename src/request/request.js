import * as qs from "./query-string.js";

//Export default HTTP error
export class HTTPError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "HTTPError";
        this.code = code;
    }
}

//Request method
export const request = function (opt, callback) {
    //Check the function arguments
    if (typeof opt === "undefined") {
        throw new Error("Undefined ajax options object");
    }
    if (typeof callback !== "function") {
        throw new Error("Undefined ajax callback function");
    }
    if (typeof opt.url === "undefined") {
        throw new Error("Undefined url");
    }
    //Parse and check the method
    opt.method = (typeof opt.method !== "string") ? "get" : opt.method.trim().toLowerCase();
    if (opt.method === "head") {
        throw new Error("Method HEAD not allowed");
    }
    //Parse the options
    opt.json = (typeof opt.json !== "boolean") ? false : opt.json;
    opt.body = (typeof opt.body === "string" || typeof opt.body === "object") ? opt.body : "";
    opt.form = (typeof opt.form === "object") ? opt.form : null;
    opt.formData = (typeof opt.formData === "object" && opt.formData instanceof FormData) ? opt.formData : null;
    opt.processData = (typeof opt.processData === "boolean") ? opt.processData : true;
    opt.auth = (typeof opt.auth === "object") ? opt.auth : null;
    opt.headers = (typeof opt.headers === "object") ? opt.headers : {};
    //Initialize the new XMLHttpRequest object
    let xhttp = new XMLHttpRequest();
    //Add the ready state change listener
    xhttp.onreadystatechange = function () {
        if (this.readyState !== 4) {
            return;
        }
        //Initilize the response object
        let response = {
            "method": opt.method,
            "statusCode": this.status,
            "statusMessage": this.statusText,
            "url": opt.url,
            "headers": {},
            "rawHeaders": this.getAllResponseHeaders().split("\n")
        };
        //Parse all the headers and save to the headers object
        response.rawHeaders.forEach(function (line) {
            if (line.trim().length === 0) {
                return;
            }
            let items = line.split(": ");
            if (items.length !== 2) {
                return;
            }
            //Save the header
            response.headers[items[0].toLowerCase().trim()] = items[1].trim();
        });
        //Initialize the response body content
        let body = null;
        try {
            //Check for parsing the body string as a JSON
            body = (opt.json === true) ? JSON.parse(this.responseText) : this.responseText;
        }
        catch (error) {
            return callback(error, response, this.responseText);
        }
        //Check for http request error
        if (response.statusCode >= 300) {
            //Call the callback with an HTTPError
            return callback(new HTTPError(response.statusCode, response.statusMessage), response, body);
        } else {
            //Call without error
            return callback(null, response, body);
        }
    };
    //Check and add the progress listener
    if (typeof opt.onProgress === "function") {
        xhttp.upload.onprogress = opt.onProgress;
    }
    //Open the connection
    xhttp.open(opt.method.toUpperCase(), opt.url, true);
    //Assign the headers
    Object.keys(opt.headers).forEach(function (key) {
        xhttp.setRequestHeader(key.toLowerCase(), opt.headers[key]);
    });
    //Check for authentication information
    if (opt.auth) {
        //Check the authentication type
        //https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#Authentication_schemes
        if (typeof opt.auth.bearer === "string") {
            //Register the bearer token authentication
            xhttp.setRequestHeader("authorization", "Bearer " + opt.auth.bearer);
        }
        else if (typeof opt.auth.basic === "string") {
            //Register the basic token authentication
            xhttp.setRequestHeader("authorization", "Basic " + opt.auth.basic);
        }
    }
    //Check for non GET request
    if (opt.method !== "get") {
        //Initialize the data
        let data = (typeof opt.body === "string") ? opt.body : "";
        //Check for form data
        if (opt.form) {
            xhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            if (opt.processData === true) {
                data = qs.stringify(opt.form);
            }
            else {
                data = opt.form;
            }
        }
        else if (opt.formData) {
            //Set the content type
            //Don't add the content-type header --> https://stackoverflow.com/a/5976031
            //xhttp.setRequestHeader("content-type", "multipart/form-data");
            data = opt.formData;
        }
        else if (opt.json === true) {
            //Add the JSON headers
            xhttp.setRequestHeader("accept", "application/json");
            xhttp.setRequestHeader("content-type", "application/json");
            try {
                //Serialize the body data
                data = (typeof opt.body === "object" && opt.processData === true) ? JSON.stringify(opt.body) : opt.body;
            }
            catch (e) {
                return callback(e, null, null);
            }
        }
        //Send the parsed data
        xhttp.send(data);
    }
    else {
        //Send the request without data
        xhttp.send(null);
    }
    //Return the XMLHttpRequest instance
    return xhttp;
};

