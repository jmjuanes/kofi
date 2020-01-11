kofi.ready(function () {
    window.app = kofi.mount(document.getElementById("root"), {
        "oninit": function () {
            this.state = {
                "status": "waiting"
            };
        },
        "handleUpload": function () {
            let self = this;
            let file = this.refs.file.files[0];
            console.log(file);
            let chunkPromise = kofi.chunk(file, kofi.chunkDefaultSize, function (chunk, next) {
                console.log(chunk);
                let formData = new FormData();
                formData.append("file", chunk.blob);
                formData.append("fileName", file.name);
                formData.append("chunkIndex", chunk.index);
                formData.append("totalChunks", chunk.total);
                formData.append("isFirstChunk", (chunk.index === 0) ? "true" : "false");
                formData.append("isLastChunk", (chunk.index + 1 === chunk.total) ? "true" : "false");
                //Update the status
                self.state.status = `Uploading chunk ${chunk.index}`;
                return self.update(function () {
                    let request = kofi.request({
                        "method": "post",
                        "url": "/upload",
                        "formData": formData
                    });
                    request.then(function (response) {
                        //console.log(response);
                        return kofi.delay(1000, function () {
                            return next(); //Next chunk
                        });
                    });
                    request.catch(function (response) {
                        //console.log(response);
                        return next(response.error); //End the upload
                    });
                });
            });
            //Run file upload
            chunkPromise.then(function () {
                return self.update({
                    "status": "Upload finished"
                });
            });
            //Run file error
            chunkPromise.catch(function () {
                return self.update({
                    "status": "Error uploading file"
                });
            });
        },
        "render": function () {
            return kofi.element("div", {},
                kofi.element("div", {}, 
                    kofi.element("input", {"type": "file", "ref": "file"})
                ),
                kofi.element("div", {},
                    kofi.element("button", {"onClick": this.handleUpload}, "Upload")
                ),
                kofi.element("div", {}, "Status: " + this.state.status)
            );
        }
    });
});
