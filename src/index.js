import {base64} from "./base64.js";
import {component, mount} from "./component.js";
import {chunk, chunkDefaultSize} from "./chunk.js";
import {cookie} from "./cookies.js";
import {dispatch} from "./dispatch.js";
import {dom} from "./dom.js";
import {element, render, stringify} from "./element.js";
//import {isObject, isArray, isFunction} from "./helpers.js";
import {delay, tempid, timestamp, values, entries, format, escape} from "./helpers.js";
import {each} from "./each.js";
import {ready} from "./ready.js";
import {qs, buildQueryString, parseQueryString} from "./query-string.js";
import {HTTPError, httpMethods, request} from "./request.js";
//import {json, object, string} from "./types.js";
import {url} from "./url.js";
import {http} from "./http.js";

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
    stringify,
    request,
    httpMethods,
    HTTPError,
    ready,
    url,
    delay,
    each,
    qs,
    buildQueryString,
    parseQueryString,
    tempid,
    timestamp,
    format,
    values,
    entries,
    escape
};

//Export kofi object
export default kofi;

