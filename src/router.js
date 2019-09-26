import {qs} from "./query-string.js";
import {url} from "./url.js";

//Build router
export class Router {
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
    load(str) {
        let self = this;
        //Check for invalid url
        if (typeof str !== "string" || str.charAt(0) !== "/") {
            throw new Error("Url must be a string and begin with a slash /");
        }
        //Save the current url 
        this._currentUrl = str;
        //Initialize the request object 
        let request = {
            "path": str,
            "pathname": str,
            "query": {},
            "params": {}
        };
        //Parse the query values
        let queryIndex = str.indexOf("?");
        if (queryIndex !== -1) {
            request.query = qs.parse(url.substring(queryIndex + 1));
            request.pathname = str.slice(0, queryIndex);
        }
        let urlPattern = url.split(request.pathname);
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
                let routePattern = url.split(route.pattern);
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
    //Reload the current route 
    reload() {
        return this.load(this._currentUrl);
    }
    //Register the notfound route 
    notFound (listener) {
        if (typeof listener === "function") {
            this._notFound = listener;
        }
    }
};

//Create a router instance
export const router = function () {
    return new Router();
};

//Get the current hashbang 
export const getHashbang = function () {
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
    //Remove the last hash and the first !
    return hash.replace(/^!/, "").replace(/\/$/, "");
};

//Change the hashbang url
export const setHashbang = function (str) {
    window.location.hash = "#!" + str.replace(/^#!/, "");
};

