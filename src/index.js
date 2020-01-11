import {app, mount} from "./app.js";
import {chunk, chunkDefaultSize} from "./chunk.js";
import {getCookie, setCookie, deleteCookie} from "./cookies.js";
import {dispatch} from "./dispatch.js";
import {element, render} from "./element.js";
import {isObject, isArray, isFunction} from "./helpers.js";
import {values, delay, format, tempid, timestamp} from "./helpers.js";
import {each} from "./each.js";
import {ready} from "./ready.js";
import {buildQueryString, parseQueryString} from "./query-string.js";
import {HTTPError, httpMethods, request} from "./request.js";
import {joinUrl, parseUrl, splitUrl, resolveUrl} from "./url.js";

//Build kofi object
const kofi = {
    app,
    mount,
    chunk,
    chunkDefaultSize,
    getCookie,
    setCookie,
    deleteCookie,
    dispatch,
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
    joinUrl,
    parseUrl,
    splitUrl,
    resolveUrl,
    delay,
    values,
    each,
    format,
    tempid,
    timestamp,
    parseQueryString,
    buildQueryString
};

//Export kofi object
export default kofi;

