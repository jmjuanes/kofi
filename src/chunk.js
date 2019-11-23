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
            //Resolve this chunk
            let resolveChunk = function () {
                return processChunk(index + 1); //Next chunk
            };
            let rejectChunk = function (reason) {
                return reject(reason); //Stop the chunk processing
            };
            //Call the provided callback method
            return callback(nextChunk, resolveChunk, rejectChunk);
        };
        //Initialize the chunk processing
        return processChunk(0);
    });
}


