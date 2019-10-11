import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), "vendor"))

import cgi
from wsgiref import simple_server
import falcon
from falcon_multipart.middleware import MultipartMiddleware

## Uploads path
uploads_path = os.path.join(os.path.dirname(__file__), "tmp")

## Get chunk path
def get_chunk_path(index):
    return os.path.join(uploads_path, "upload-chunk-" + str(index))

## Home route
class RouteHome(object):
    def on_get(self, req, res):
        res.content_type = "text/html"
        with open("index.html", "r") as f:
            res.body = f.read()
        res.status = falcon.HTTP_200

## Kofi static file route
class RouteKofi(object):
    def on_get(self, req, res):
        res.content_type="text/javascript"
        with open("../../dist/kofi.umd.js", "r") as f:
            res.body = f.read()
        res.status = falcon.HTTP_200

## Upload route
class RouteUpload(object):
    def on_post(self, req, res):
        ## Handle multipart/form-data:
        ## https://falcon.readthedocs.io/en/stable/user/faq.html#how-can-i-access-posted-files
        ## Save the uploaded file
        chunk_index = int(req.get_param("chunkNumber")) - 1
        total_chunks = int(req.get_param("totalChunks"))
        print("Chunk index: " + str(chunk_index))
        ## Save the uploaded chunk
        chunk_path = get_chunk_path(chunk_index)
        with open(chunk_path, "wb") as f:
            f.write(req.get_param("file").file.read())
        ## Check if is the last chunk
        if req.get_param("isLastChunk") == "true":
            ## Merge all files
            target_path = os.path.join(uploads_path, req.get_param("fileName"))
            with open(target_path, "ab") as f:
                for x in range(0, total_chunks):
                    #print("Adding chunk " + str(x))
                    chunk_path = get_chunk_path(x)
                    with open(chunk_path, "rb") as g:
                        f.write(g.read())
                    ## TODO: remove partial chunk
        ## DONE
        res.status = falcon.HTTP_200
        res.body = "{}"


## Generic error handler
def generic_error_handler(ex, req, res, params):
    # Ignore HTTPError and re-raise
    if isinstance(ex, falcon.HTTPError):
        raise
    print(str(ex))
    raise falcon.HTTPInternalServerError(title="A server error occurred.")


## Custom error serializer
def error_serializer(req, res, exception):
    ## Custom error message
    res.media = {
        "message": exception.title,
        "status": exception.status
    }
    res.content_type = falcon.MEDIA_JSON

## Build falcon app
app = falcon.API(middleware=[MultipartMiddleware()])
app.add_route("/", RouteHome())
app.add_route("/kofi.js", RouteKofi())
app.add_route("/upload", RouteUpload())
app.add_error_handler(Exception, generic_error_handler)
app.set_error_serializer(error_serializer)

## Start simple server for testing
if __name__ == "__main__":
    httpd = simple_server.make_server("127.0.0.1", 3000, app)
    httpd.serve_forever()

