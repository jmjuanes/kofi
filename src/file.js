//Promised file reader
const readFileAs = function (blob, as) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        //Register reader load event --> resolve the promise
        reader.addEventListener("load", function (event) {
            return resolve(event.target.result);
        });
        //Register reader error event --> reject the promise
        reader.addEventListener("error", function (event) {
            return reject(new Error("Error reading file: " + event.target.result));
        });
        //Read the file
        return reader["readAs" + as](blob);
    });
};

//Slice a blob in chunks of the provided size, and call a function for each chunk.
//Returns a promise that resolves if all chunks have been processed
//Rejects if there was an error processing a chunk
const sliceFileSize = 1048576; //1Mb
const sliceFile = function (blob, size, callback) {
    //let size = blob.size;
    let total = Math.ceil(blob.size / size); //Total number of chunks
    return new Promise (function (resolve, reject) {
        //Process chunk iterator
        let processChunk = function (index) {
            if (index >= total) {
                return resolve();
            }
            //Prepare the next chunk
            let start = index * size;
            let end = Math.min(start + size, blob.size);
            let nextChunk = {
                "index": index,
                "blob": blob.slice(start, end),
                "start": start,
                "end": end,
                "total": total
            };
            //Call the provided callback method
            return callback(nextChunk, function (error) {
                if (typeof error !== "undefined" && error !== null) {
                    return reject(error); //Stop the chunk processing
                }
                //Next chunk
                return processChunk(index + 1);
            });
        };
        //Initialize the chunk processing
        return processChunk(0);
    });
};

//Download the provided file content
const downloadFile = function (name, type, content) {
    let url = `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
    let link = document.createElement("a");
    link.setAttribute("download", name);
    link.setAttribute("href", url);
    return link.click();
};

//File reader class
export const file = {
    "readAsText": function (blob) {
        return readFileAs(blob, "Text");
    },
    "readAsJSON": function (blob) {
        return readFileAs(blob, "Text").then(JSON.parse);
    },
    "readAsDataURL": function (blob) {
        return readFileAs(blob, "DataURL");
    },
    "readAsArrayBuffer": function (blob) {
        return readFileAs(blob, "ArrayBuffer");
    },
    "download": downloadFile,
    "slice": sliceFile,
    "sliceSize": sliceFileSize
};

