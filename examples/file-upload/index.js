let fs = require("fs");
let path = require("path");
let express = require("express");
let multer = require("multer");
let bodyParser = require("body-parser");

//Configure multer upload
let upload = multer({
    "dest": path.join(process.cwd(), "tmp")
});

//Get chunk filename
let getChunkPath = function (index) {
    return path.join(process.cwd(), "tmp", `upload-file-part-${index}`);
};

//Handle file upload
let handleFileUpload = function (req, res) {
    //Print upload metadata
    console.log(req.body);
    //console.log(req.file);
    let isFirstChunk = req.body.isFirstChunk === "true";
    let isLastChunk = req.body.isLastChunk === "true";
    let chunkIndex = parseInt(req.body.chunkNumber) - 1;
    let totalChunks = parseInt(req.body.totalChunks);
    //console.log("Chunk index: " + chunkIndex);
    //console.log("Total chunks: " + totalChunks);
    //Rename this chunk
    return fs.rename(req.file.path, getChunkPath(chunkIndex), function (error) {
        if (error) {
            return res.sendStatus(500);
        }
        //Check if this is not the last chunk
        if (isLastChunk === false) {
            return res.sendStatus(200);
        }
        //Concatenate all files
        let outputPath = path.join(process.cwd(), "tmp", req.body.fileName); 
        let target = fs.createWriteStream(outputPath);
        //Process each chunk
        let concatChunk = function (index) {
            let source = fs.createReadStream(getChunkPath(index));
            //Pipe to the target stream
            source.pipe(target, {
                "end": false
            });
            //When source stream finishes
            source.on("end", function () {
                //Check if there are more chunks to concat
                if (index + 1 < totalChunks) {
                    return concatChunk(index + 1);
                }
                //Finish the write stream
                target.end();
                //Finish the response
                return res.sendStatus(200);
            });
            //Error
            source.on("error", function () {
                //target.end();
                return res.sendStatus(500);
            });
        };
        //Start chunk concat
        return concatChunk(0);
    });
};

//Mount app
process.nextTick(function () {
    let app = express();
    //Host public stuff
    app.use(express.static(path.join(__dirname, "public")));
    //Post file
    app.post("/upload", upload.single("file"), handleFileUpload); 
    //Get kofi module
    app.get("/kofi.js", function (req, res) {
        return res.sendFile(path.resolve(__dirname, "../../dist/kofi.umd.js"));
    }); 
    //Listen 
    app.listen(3000);
});

