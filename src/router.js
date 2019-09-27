import {qs} from "./query-string.js";
import {url} from "./url.js";

//Get the current hashbang 
const getHashbang = function () {
    //Decode the current hash
    //let hash = window.decodeURIComponent(window.location.hash.substring(1));
    let hash = window.location.hash.substring(1);
    //Check for empty hash or not valid hash
    if (hash.trim() === "" || hash.charAt(0) !== "!") {
        return "";
    }
    //Remove the last hash and the first !
    return hash.replace(/^!/, "").replace(/\/$/, "");
};

//Change the hashbang url
const setHashbang = function (str) {
    window.location.hash = "#!" + str.replace(/^#!/, "");
};

//Build router
export class BaseRouter {
    constructor() {
        this._current = null;
        this._routes = [];
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
    //Get the current path
    get() {
        return this._current;
    }
    //Set the current path
    set(str) {
        return setHashbang(str);
    }
    //Open a route
    load(str) {
        let self = this;
        //Check for invalid url
        if (typeof str !== "string" || str.charAt(0) !== "/") {
            throw new Error("Url must be a string and begin with a slash /");
        }
        //Save the current url 
        this._current = str;
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
            //No listeners found
            if (index >= self._routes.length) {
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
    refresh() {
        return this.load((this._current === null) ? getHashbang() : this._current);
    }
    //Listen to hash changes
    listen() {
        let self = this;
        //Register the hash change listener
        window.addEventListener("hashchange", function () {
            return self.load(getHashbang());
        });
        //Load the first time
        return this.refresh();
    }
};

//Create a router instance
export const router = new BaseRouter();

