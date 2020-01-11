//Slice a blob in chunks of the provided size, and call a function for each chunk.
//Returns a promise that resolves if all chunks have been processed
//Rejects if there was an error processing a chunk
export function chunk (blob, size, callback) {
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
                if (typeof error !== "undefined") {
                    return reject(error); //Stop the chunk processing
                }
                //Next chunk
                return processChunk(index + 1);
            });
        };
        //Initialize the chunk processing
        return processChunk(0);
    });
}

//Export chunk default size: 1MB
export const chunkDefaultSize = 1048576;


