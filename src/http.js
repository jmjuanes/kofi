import {buildQueryString} from "./query-string.js";
import {HTTPError} from "./request.js";

//Export http module
export function http (options) {
    //Check for string value --> use it as options.url parameter
    if (typeof options === "string") {
        options = {"url": options};
    }
    //Return a new promise that resolves when the request is completed
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        let body = options.body || null; //Default to empty message
        request.open(options.method || "get", options.url, true); //Open connection
        //Register load listener --> process response
        request.addEventListener("load", function () {
            //Check for request error
            if (request.status > 299) {
                return reject(new HTTPError(request.status, request.statusText));
            }
            //Build response message
            let response = {
                //ok": request.status < 300,
                "statusText": request.statusText,
                "statusCode": request.status,
                "url": request.responseURL,
                "raw": request, //Raw response data
                "headers": {},
                //Convert response to text
                "text": function () {
                    return Promise.resolve(request.responseText);
                },
                //Convert response to JSON
                "json": function () {
                    return Promise.resolve(request.responseText).then(JSON.parse);
                },
                //Convert response to blob
                "blob": function () {
                    return Promise.resolve(new Blob([request.response]));
                }
            };
            //Parse all the headers and save to the headers object
            request.getAllResponseHeaders().split(/[\r\n]+/).forEach(function (line) {
                let items = line.split(": ");
                if (items.length === 2) {
                    response.headers[items[0].toLowerCase().trim()] = items[1].trim();
                }
            });
            //Submit response
            return resolve(response);
        });
        //Register error listener
        request.addEventListener("error", reject);
        //Assign the headers to the request
        Object.keys(options.headers || {}).forEach(function (key) {
            return request.setRequestHeader(key.toLowerCase(), options.headers[key]);
        });
        //Check for JSON data to upload --> serialize as string and set json content-type header
        if (typeof options.json === "object") {
            body = JSON.stringify(options.json); //Convert json data to string
            request.setRequestHeader("content-type", "application/json");
        }
        //Check for form object --> serialize as query-string and set form header
        else if (typeof options.form === "object") {
            body = buildQueryString(options.form); //convert to query-string
            request.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        }
        //Check for formdata object provided
        else if (options.formData) {
            //Don't add the content-type header --> https://stackoverflow.com/a/5976031
            //xhttp.setRequestHeader("content-type", "multipart/form-data");
            body = options.formData;
        }
        //Add credentials to request (cookies, ...)
        //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        request.withCredentials = options.credentials === true;
        //Send the request
        return request.send(body);
    });
}

//Register some HTTP aliases to automatically convert http responses
Object.assign(http, {
    "text": function (opt) {
        return http(opt).then(function (res) { return res.text(); });
    },
    "json": function (opt) {
        return http(opt).then(function (res) { return res.json(); });
    },
    "blob": function (opt) {
        return http(opt).then(function (res) { return res.blob(); });
    }
});

