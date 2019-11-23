import {app, createApp} from "./app.js";
import {chunk} from "./chunk.js";
import {getCookie, setCookie, deleteCookie} from "./cookies.js";
import {dispatch} from "./dispatch.js";
import {element, render} from "./element.js";
import {isObject, isArray, isFunction} from "./helpers.js";
import {value, freeze, each} from "./helpers.js";
import {delay, format, tempid, range} from "./helpers.js";
import {ready} from "./ready.js";
import {buildQueryString, parseQueryString} from "./query-string.js";
import {HTTPError, httpMethods, request} from "./request.js";
import {joinUrl, parseUrl, splitUrl, resolveUrl} from "./url.js";

//Build kofi object
const kofi = {
    app,
    createApp,
    chunk,
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
    freeze,
    each,
    format,
    tempid,
    range,
    parseQueryString,
    buildQueryString
};

//Export kofi object
export default kofi;

