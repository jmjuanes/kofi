import {addNodeChildren, removeNodeChildren} from "./dom/children.js";
import {createNode, removeNode} from "./dom/node.js";
import {Fragment} from "./dom/fragment.js";
import {createRef} from "./dom/ref.js";
import {qs} from "./query-string.js";
import {url} from "./url.js";
import {request, HTTPError} from "./request.js";
import {fileUpload} from "./file-upload.js";
import {dispatch} from "./dispatch.js";
import {queue} from "./queue.js";
import {ready} from "./ready.js";
import {router} from "./router.js";
import {delay, timer} from "./time.js";
import * as helpers from "./helpers/index.js";

//Build kofi object
const kofi = {
    createNode,
    removeNode,
    addNodeChildren,
    removeNodeChildren,
    Fragment,
    createRef,
    request,
    HTTPError,
    fileUpload,
    url,
    qs,
    router,
    dispatch,
    queue,
    ready,
    helpers,
    delay,
    timer
};

//Export kofi object
export default kofi;

