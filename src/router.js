import {qs} from "./query-string.js";

//Parse a pattern string 
let parseUrlPattern = function (str) {
    //Split the pattern string by slashes
    let pattern = str.trim().split("/");
    //Check for empty pattern
    if (pattern.length === 0) {
        return [];
    }
    //Check for empty first item
    if (pattern[0].trim().length === 0) {
        pattern.shift()
    }
    //Check for empty las item
    if (pattern[pattern.length - 1].trim().legnth === 0) {
        pattern.pop();
    }
    //Return the parsed pattern
    return pattern;
};

//Build router
class Router {
    constructor() {
        this._currentUrl = "/";
        this._routes = [];
        this._notFound = null;
    }
    //Register a new route 
    route(pattern, listener) {
        if (typeof pattern === "function") {
            //Register the route as a global route
            return this.route("*", pattern);
        }
        //Register this route
        this._routes.push({
            "pattern": pattern.trim(), 
            "listener": listener
        });
    }
    //Open a route
    _open(url) {
        let self = this;
        //Check for invalid url
        if (typeof url !== "string" || url.charAt(0) !== "/") {
            throw new Error("Url must be a string and begin with a slash /");
        }
        //Save the current url 
        this._currentUrl = url;
        //Initialize the request object 
        let request = {
            "path": url,
            "pathname": url,
            "query": {},
            "params": {}
        };
        //Parse the query values
        let queryIndex = url.indexOf("?");
        if (queryIndex !== -1) {
            request.query = qs.parse(url.substring(queryIndex + 1));
            request.pathname = url.slice(0, queryIndex);
        }
        let urlPattern = parseUrlPattern(request.pathname);
        let findRoute = function (index) {
            if (index >= self._routes.length) {
                //Check if the not found listener is provided
                if (typeof self._notFound === "function") {
                    return self._notFound.call(null, request);
                }
                return null;
            }
            let route = self._routes[index];
            if (route.pattern !== "*") {
                let routePattern = parseUrlPattern(route.pattern);
                //Check if the number of items of the pattern is the same
                if (routePattern.length !== urlPattern.length) {
                    //Continue with the next route
                    return findRoute(index + 1);
                }
                let params = {};
                //Check all pattern items
                for (let i = 0; i < routePattern.length; i++) {
                    //Check for dynamic pattern
                    if (routePattern[i].charAt(0) === ":") {
                        let key = routePattern[i].substring(1);
                        params[key] = urlPattern[i];
                    }
                    else if (routePattern[i] !== urlPattern[i]) {
                        //Pattern not valid, continue with the next route 
                        return findRoute(index + 1);
                    }
                }
                //Save the params
                request.params = params;
            }
            //Call the listener of this route
            return route.listener.call(null, request, function () {
                return findRoute(index + 1);
            });
        };
        //Find the route
        return findRoute(0);
    }
    //Load a route 
    load(url) {
        return this._open(url);
    }
    //Reload the current route 
    reload() {
        return this._open(this._currentUrl);
    }
    //Register the notfound route 
    notFound (listener) {
        if (typeof listener === "function") {
            this._notFound = listener;
        }
    }
};

//Get the current hashbang 
let getHashbang function () {
    //Decode the current hash
    //let hash = window.decodeURIComponent(window.location.hash.substring(1));
    let hash = window.location.hash.substring(1);
    //Check for empty hash
    if (hash.trim() === "") {
        hash = "!/";
    }
    //Check for no hashbang hash
    if (hash.charAt(0) !== "!") {
        return null;
    }
    //Remove the last hash
    hash = hash.replace(/\/$/, "");
    //Return the hash
    return hash;
};

//Hashbang change listener
let onHashbangChange = function (listener) {
    //Add hash listener
    window.addEventListener("hashchange", function () {
        //Get the current hash
        let hash = getHashbang();
        //Check for valid hashbang
        if (hash !== null) {
            //Call the listener with this url
            return listener.call(null, hash);
        }
    });
};

//Change the hashbang url
let setHashbang = function (url) {
    //Replace the starting hash and the excalamtion
    let parsedUrl = url.replace("#", "").replace("!", "");
    //Check for emptu url 
    if (parsedUrl === "") {
        parsedUrl = "/";
    }
    //Change the current hash location
    window.location.hash = "#!" + parsedUrl;
};

//Export router wrapper
export const router = {
    "create": function () {
        return new Router();
    },
    "Router": Router,
    "parseUrlPattern": parseUrlPattern,
    "hashbang": {
        "get": getHashbang,
        "set": setHashbang,
        "onChange": onHashbangChange
    }
};


