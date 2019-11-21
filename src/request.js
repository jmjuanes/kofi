import {buildQueryString} from "./query-string.js";

//HTTP error class
export class HTTPError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "HTTPError";
        this.code = code;
    }
}

//Default HTTP methods
export const httpMethods = [
    "get", 
    "post", 
    "patch", 
    "put", 
    "delete", 
    "options"
];

//Default status code validator
//By default, reject if the status code is greater than or equal to 300
function validateStatus (status) {
    return status >= 300;
}

//Perform the request with the given configuration
export function request (options) {
    //Check the url
    if (typeof options.url !== "string") {
        throw new Error("No url provided");
    }
    //Parse and check the method
    options.method = (typeof options.method !== "string") ? "get" : options.method.trim().toLowerCase();
    else if (httpMethods.indexOf(options.method) === -1) {
        throw new Error(`Method ${options.method} not available`);
    }
    //Parse the options
    options.json = (typeof options.json !== "boolean") ? false : options.json;
    options.body = (typeof options.body === "string" || typeof options.body === "object") ? options.body : "";
    options.form = (typeof options.form === "object") ? options.form : null;
    options.formData = (typeof options.formData === "object" && options.formData instanceof FormData) ? options.formData : null;
    options.processData = (typeof options.processData === "boolean") ? options.processData : true;
    options.headers = (typeof options.headers === "object") ? options.headers : {};
    //options.auth = (typeof opt.auth === "object") ? opt.auth : null; // <<< Deprecated (use headers instead)
    options.validateStatus = (typeof options.validateStatus === "function") ? options.validateStatus : validateStatus;
    //Return the request promise
    return new Promise(function (resolve, reject) {
        //Initialize the new XMLHttpRequest object
        let xhttp = new XMLHttpRequest();
        //Add the ready state change listener
        xhttp.onreadystatechange = function () {
            if (this.readyState !== 4) {
                return; // --> Request not ready yet
            }
            //Initilize the response object
            let response = {
                "error": null,
                "method": options.method,
                "statusCode": this.status,
                "statusMessage": this.statusText,
                "url": options.url,
                "headers": {},
                "rawHeaders": this.getAllResponseHeaders().split("\n"),
                "body": this.responseText
            };
            //Parse all the headers and save to the headers object
            response.rawHeaders.forEach(function (line) {
                if (line.trim().length === 0) {
                    return; // --> Empty header (TODO: throw error)
                }
                let items = line.split(": ");
                if (items.length !== 2) {
                    return; // --> Invalid header (TODO: throw error)
                }
                //Save the header
                response.headers[items[0].toLowerCase().trim()] = items[1].trim();
            });
            //Parse the body 
            try {
                //Check for parsing the body string as a JSON
                if (options.json === true) {
                    response.body = JSON.parse(this.responseText);
                }
            }
            catch (error) {
                //Error parsing body data --> reject
                return reject(Object.assign(response, {
                    "error": errori
                }));
            }
            //Check for http request error
            if (options.validateStatus(response.statusCode) !== true) {
                //return reject(new HTTPError(response.statusCode, response.statusMessage));
                return reject(Object.assign(response, {
                    "error": new HTTPError(response.statusCode, response.statusMessage)
                }));
            }
            //Call without error
            return resolve(response);
        };
        //Add the upload started listener
        if (typeof options.onUploadStart === "function") {
            xhttp.upload.onloadstart = function (event) {
                return options.onUploadStart(event);
            };
        }
        //Add the upload progress listener
        if (typeof options.onUploadProgress === "function") {
            //Create a wrapper for calling the provided on-progress method
            // event: an event instance with the following wanted fields
            //  - loaded: amount of data currently transfered
            //  - total: total amount of data to be transferred
            xhttp.upload.onprogress = function (event) {
                return options.onUploadProgress(event);
            };
        }
        //Add the upload end listener
        if (typeof options.onUploadEnd === "function") {
            xhttp.upload.onload = function (event) {
                return options.onUploadEnd(event);
            };
        }
        //Open the connection
        xhttp.open(options.method.toUpperCase(), options.url, true);
        //Assign the headers
        Object.keys(options.headers).forEach(function (key) {
            xhttp.setRequestHeader(key.toLowerCase(), options.headers[key]);
        });
        //Prepare the data to send to the server
        let data = null;
        //Check for non GET request
        if (options.method !== "get") {
            //Initialize the data
            let data = (typeof options.body === "string") ? opt.body : "";
            //Check for form data
            if (options.form) {
                xhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                data = (options.processData) ? buildQueryString(options.form) : options.form;
            }
            //Check for formdata object provided
            else if (options.formData) {
                //Don't add the content-type header --> https://stackoverflow.com/a/5976031
                //xhttp.setRequestHeader("content-type", "multipart/form-data");
                data = options.formData;
            }
            else if (options.json === true) {
                //Add the JSON headers
                xhttp.setRequestHeader("accept", "application/json");
                xhttp.setRequestHeader("content-type", "application/json");
                //Serialize the body data
                try {
                    if (typeof options.body === "object" && options.processData === true) {
                        data = JSON.stringify(options.body);  // <<-- Stringify and save the body
                    }
                }
                catch (error) {
                    return reject(error); // <<-- Error parsing body data
                }
            }
        }
        //Check the before send option
        if (typeof options.beforeSend === "function") {
            options.beforeSend.call(null, xhttp); // <--- Provide the xhttp instance
        }
        //Send the request
        xhttp.send(data);
    });
}

