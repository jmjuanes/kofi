import {request} from "./request.js";

//Default oprions
let defaultOtpions = {
    "file": null,
    "url": null,
    "chunkSize": 1048576, // 1MB Chunk size
    "chunkRetry": 0,  //Number of times to retry chunk upload
    "method": "post",  //Default upload method
    "type": "multipart", //Default upload type
    "query": {},    //Extra parameters to include in the request
    "headers": {},  //Extra headers to include in the request
    "fileParam": "file",
    //Event listeners
    "onFinish": null,
    "onChunkError": null,
    "onChunkUploadStart": null,
    "onChunkUploadEnd": null,
    "onChunkRequest": null
};

//Call the provided function with the provided arguments
let callfn = function (fn, args) {
    //Chekc if the first argument is a function
    if (typeof fn === "function") {
        return fn.apply(null, args);
    }
    //No function provided: return the value itself
    return fn;
};

//Secure assign method
let assign = function (source) {
    //Assign the other arguments
    for (let i = 1; i < arguments.length; i++) {
        //Check only for valid object and not null
        if (typeof arguments[i] === "object" && arguments[i] !== null) {
            Object.assign(source, arguments[i]);
        }
    }
    //Return the assigned object
    return source;
};

//Handle file upload
export function fileUpload (args, callback) {
    //Assign to default options object
    let state = Object.assign({}, defaultOptions, args);
    //Save metadata to the current upload state
    Object.assign(state, {
        "totalSize": state.file.size,
        "totalChunks": Math.ceil(state.file.size / state.chunkSize)
    });
    //Prepare next chunk
    let prepareNextChunk = function (index) {
        //Get the chunk start and end values
        let start = index * state.chunkSize;
        let end = Math.min(state.totalSize, start + state.chunkSize);
        //Return the next chunk options
        return {
            "blob": state.file.slice(start, end),
            "start": start,
            "end": end,
            "retries": 0,
            "index": index
        };
    };
    //Handle chunk upload
    let handleChunkUpload = function (chunk) {
        //Build the chunk props
        let chunkProps = [chunk.blob, chunk.index, chunk.start, chunk.end, chunk.blob.size];
        //Build the form data
        let formData = new FormData();
        let queryData = assign({}, callfn(state.query, chunkProps), {
            "chunkNumber": chunk.index + 1,
            "chunkStart": chunk.start,
            "chunkEnd": chunk.end,
            "chunkSize": chunk.blob.size,
            "totalChunks": state.totalChunks,
            "totalSize": state.totalSize,
            "chunkRetries": chunk.retries,
            "isFirstChunk": chunk.index === 0,
            "isLastChunk": chunk.index === (state.totalChunks - 1)
        });
        Object.keys(queryData).forEach(function (key) {
            formData.append(key, queryData[key]);
        });
        //Add the file
        formData.append(state.fileParam, chunk.blob);
        //Prepare request values
        let chunkRequest = {
            "method": state.method,
            "url": getPropertyValue(state.url, chunkProps),
            "headers": assign({}, callfn(state.headers, chunkProps)),
            "formData": formData
        };
        //Add the request object to the list of chunk props
        //chunkProps.push(request);
        //Parse the request object
        if (typeof state.onChunkRequest === "function") {
            state.onChunkRequest.call(null, chunkRequest);
        }
        //Call the chunk upload start listener only if it is the first time we upload the chunk
        if (chunk.retries === 0) {
            callfn(state.onChunkUploadStart, chunkProps);
        }
        //Upload this chunk
        return request(chunkRequest, function (error, response) {
            //Check for error uploading this chunk
            if (error) {
                //Check the retry index
                if (chunk.retries < state.chunkRetries) {
                    return handleChunkUpload(assign(chunk, {
                        "retries": chunk.retries + 1
                    }));
                }
                //Call the error listener and abort the upload
                return callfn(state.onChunkError, chunkProps);
            }
            //Chunk uploaded
            callfn(state.onChunkUploadEnd, chunkProps);
            //Check if this was the last chunk in the list
            if (chunk.index === (state.totalChunks - 1)) {
                //Call the on finish method
                if (typeof callback === "function") {
                    return callfn(callback, []);
                }
                //Call the onFinish method
                return callfn(state.onFinish, []);
            }
            //Continue with the next chunk
            let nextChunk = prepareNextChunk(chunk.index + 1); 
            return handleChunkUpload(nextChunk);
        });
    };
    //Start chunk upload
    handleChunkUpload(prepareNextChunk(0));
};

