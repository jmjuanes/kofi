import {base64} from "./base64.js";
import {component, mount} from "./component.js";
import {chunk, chunkDefaultSize} from "./chunk.js";
import {cookie} from "./cookies.js";
import {dispatch} from "./dispatch.js";
import {dom} from "./dom.js";
import {element, render} from "./element.js";
import {isObject, isArray, isFunction} from "./helpers.js";
import {delay, tempid, timestamp} from "./helpers.js";
import {each} from "./each.js";
import {object} from "./object.js";
import {ready} from "./ready.js";
import {qs} from "./query-string.js";
import {HTTPError, httpMethods, request} from "./request.js";
import {string} from "./string.js";
import {url} from "./url.js";

//Build kofi object
const kofi = {
    base64,
    component,
    mount,
    chunk,
    chunkDefaultSize,
    cookie,
    dispatch,
    dom,
    element,
    render,
    isObject,
    isArray,
    isFunction,
    request,
    httpMethods,
    HTTPError,
    ready,
    element,
    url,
    object,
    string,
    delay,
    each,
    qs,
    tempid,
    timestamp
};

//Export kofi object
export default kofi;

