// Escape and unescape helper method
const escape = str => encodeURIComponent(str);
const unescape = str => decodeURIComponent(str.replace(/\+/g, " "));

//Non closing tags
const nonClosingTags = ["link", "meta", "input", "br", "img", "hr"];

//Create a dom element
const element = (type, props, ...children) => {
    if (type && typeof type === "string") {
        return {
            "type": type.toLowerCase().trim(), 
            "props": props || {}, 
            "children": (children || []).filter(child => !!child),
        };
    }
    // Check for function type
    else if (typeof type === "function") {
        return type(props, children);
    }
    // Other type --> throw error
    throw new Error("Invalid element type provided");
};

// Render an element
const render = (parent, el) => {
    let node = null; // Initialize output node
    //Check for text node
    if (typeof el === "string") {
        node = document.createTextNode(el);
    }
    else {
        //Create the new DOM element and assign the element properties
        node = document.createElement(el.type);
        Object.keys(el.props || {}).forEach(name => {
            name !== "html" && setProperty(node, name, el.props[name]);
        });
        //Check if html property has been provided
        if (typeof el.props?.html === "string") {
            node.innerHTML = el.props.html; //Inject html
        }
        //If no html property has been provided
        else {
            el.children.forEach(child => render(node, child));
        }
    }
    //Mount the new node
    if (parent) {
        parent.appendChild(node);
    }
    return node;
};

//Convert a VDOM element to string
const stringify = (el, delimiter) => {
    if (typeof el === "string") {
        return el; //String node --> nothing to do
    }
    //Build attributes of this element
    const attrs = Object.keys(el.props || {}).map(name => {
        const value = el.props[name]; //Get attribute value
        //Check for boolean value
        if (value === true) {
            return name; //Return only the property name
        }
        //Check for className attribute
        else if (name === "className" && typeof value === "string") {
            return `class="${value}"`;
        }
        //Check for style and object value
        else if (name === "style" && typeof value === "object") {
            //Convert all style values to string to snake-case format
            const styleValues = Object.keys(value).map(key => {
                return `${key.split(/(?=[A-Z])/).join("-").toLowerCase()}:${value[key]}`;
            });
            return `style="${styleValues.join(";")}"`;
        }
        //Check for string value --> set the value
        else if (typeof value === "string" && name !== "ref" && name !== "html") {
            return `${name}="${value}"`;
        }
        //Other value --> nothing to do
        return "";
    }).filter(v => !!v);
    //Check if this tag is in the non closing tags list
    if (nonClosingTags.indexOf(el.type) > -1) {
        return `<${el.type} ${attrs.join(" ")} />`;
    }
    //Build the content of the element
    const content = el.props?.html ? [el.props.html] : (el.children || []).map(child => {
        return stringify(child, delimiter);
    });
    //Return the element with the content
    return `<${el.type} ${attrs.join(" ")}>${content.join(delimiter || "")}</${el.type}>`;
};

//Update an element
const update = (parent, newNode, oldNode, index) => {
    index = index && typeof index === "number" ? index : 0;
    const child = parent.childNodes[index];
    //Check for no old node --> mount this new element
    if (!oldNode) { 
        return render(parent, newNode); 
    }
    //If there is not new element --> remove the old element
    else if (!newNode) { 
        return parent.removeChild(child); 
    }
    //If nodes has changed
    else if (nodesDiffs(newNode, oldNode)) {
        return parent.replaceChild(render(null, newNode), child);
    }
    //Change the properties only if element is not an string
    else if (newNode && typeof newNode !== "string") {
        //Get the full properties values and update the element attributes
        const props = Object.assign({}, newNode.props, oldNode.props);
        Object.keys(props).forEach(name => {
            const newValue = newNode.props[name];
            const oldValue = oldNode.props[name];
            if (name !== "html" && newValue !== oldValue) {
                setProperty(child, name, newValue);
            }
        });
        //Update the children for all element
        const maxLength = Math.max(newNode.children.length, oldNode.children.length);
        for (let i = 0; i < maxLength; i++) {
            update(child, newNode.children[i], oldNode.children[i], i);
        }
    }
};

//Check if there are differences between two nodes
const nodesDiffs = (node1, node2) => {
    //Check if nodes have the same type
    if (typeof node1 !== typeof node2) { 
        return true; 
    }
    //Check if nodes are strings
    else if (typeof node1 === "string" && node1 !== node2) { 
        return true; 
    }
    //Check if nodes has not the same tag
    else if (node1.type !== node2.type) { 
        return true; 
    }
    //Default, nodes are the same
    return false;
};

//Set a property
const setProperty = (el, name, value = null) => {
    // Reference key
    if (name === "ref" && value) {
        value.current = el; // Save reference to element
    }
    // Check for style property and string value --> set as css string
    else if (name === "style") {
        if (value && typeof value === "object") {
            el.style.cssText = null; // Clear styles
            Object.keys(value).forEach(k => el.style[k] = value[k]);
        }
        else {
            el.style.cssText = value;
        }
    }
    // Check for event listener property
    else if (name.startsWith("on")) {
        el[key.toLowerCase()] = value;
    }
    // Default: set the property value
    else if (name !== "html" && name !== "ref") {
        // el.setAttribute(key, value)
        el[key] = value;
    }
};

// Create a kofi application
const app = (parent, component) => {
    let canUpdateComponent = true;
    let oldVdom = null; // Previous vdom
    let debounceUpdate = null; // Update component function
    const props = {}; // Component props
    const dispatcher = dispatch();
    const hooks = {index: 0, list: []};
    const getHook = value => {
        let hook = hooks.list[hooks.index++];
        if (!hook) {
            hook = {value};
            hooks.list.push(hook); // Save new hook
        }
        return hook;
    };
    // Actions object
    const actions = {
        dispatch: dispatcher.dispatch,
        forceUpdate: () => debounceUpdate(),
        useProp: (name, defaultValue) => {
            return typeof props[name] !== "undefined" ? props[name] : defaultValue;
        },
        useRef: () => ({current: null}),
        useState: initialState => {
            const hook = getHook(initialState);
            const updateState = newState => {
                hook.value = newState;
                debounceUpdate();
            };
            return [hook.value, updateState];
        },
        useEffect: (cb, args) => {
            const hook = getHook(null);
            if (!hook.value || args.some((v, i) => v !== hook.value[i])) {
                hook.value = args || null;
                hook.cb = cb;
            }
        },
        useRouter: (initialPath, routes) => {
            const hook = getHook(null);
            if (!hook.value) {
                hook.value = router(initialPath, routes);
            }
            // Create router element and redirect dispatcher
            const RouterElement = () => hook.value.refresh() || null;
            const redirect = newPath => {
                hook.value.path = newPath || "/";
                return debounceUpdate();
            };
            // Return router
            return [RouterElement, redirect];
        },
        useStore: initialStore => {
            const hook = getHook(null);
            if (!hook.value) {
                hook.value = store(initialStore);
            }
            // Return current store and update ref
            return [hook.value.get(), hook.value.update];
        },
    };
    //Define component update method
    debounceUpdate = debounce(50, () => {
        hooks.index = 0; // Reset hooks index
        const newVdom = component(actions);
        oldVdom ? update(parent, newVdom, oldVdom) : render(parent, newVdom);
        oldVdom = newVdom; // Update current vdom
        // Call all useEffect hooks
        hooks.list.filter(h => typeof h?.cb === "function").forEach(hook => {
            hook.cb();
            delete hook.cb; // Remove callback 
        });
    });
    clearNode(parent); // Clear parent element
    debounceUpdate(); // First render
    // Return component manager
    // return dispatcher;
    return {
        on: (name, fn) => dispatcher.on(name, fn),
        addEventListener: (name, fn) => dispatcher.on(name, fn),
        setProp: (key, value) => {
            props[key] = value;
            debounceUpdate();
        },
        getProp: key => props[key],
        destroy: () => null, // TODO
    };
};

// Execute the specified function when the DOM is ready
const ready = fn => {
    //Resolve now if DOM has already loaded
    if (document.readyState !== "loading") {
        return fn();
    }
    //If not, wait for DOMContentLoaded event
    document.addEventListener("DOMContentLoaded", () => {
        return fn();
    });
};

// Clear a DOM node
const clearNode = node => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

// Remove a DOM node
const deleteNode = node => {
    return node.parentNode && node.parentNode.removeChild(node);
};

// Tiny event dispatcher
const dispatch = () => ({
    events: {}, //Events listeners
    // Register a new event listener
    on: function (name, fn) {
        (this.events[name] = this.events[name] || []).push(fn);
    },
    // Remove an event listener
    off: function (name, fn) {
        this.events[name] = (this.events[name] || []).filter(f => f !== fn);
    },
    // Dispatch an event
    dispatch: function (name, ...args) {
        (this.events[name] || []).forEach(fn => fn(...args));
    },
});

// Tiny store manager
const store = initialState => ({
    state: initialState || {},
    listeners: [],
    // Methods to manipulate the state
    get: function () {
        return this.state;
    },
    update: function (mutation) {
        if (typeof mutation === "function") {
            Object.assign(this.state, mutation(this.state));
        }
        else if (typeof mutation === "object") {
            Object.assign(this.state, mutation || {});
        }
        // Run the listeners with the new state
        this.listeners.forEach(f => f(this.state));
    },
    mutate: function (fn) {
        return (...args) => this.update(fn(this.state, ...args));
    },
    // Subscribe to state changes
    subscribe: function (fn) {
        this.listeners.push(fn);
        fn(this.state); // Call the listener with the current state
        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(f => f !== fn);
        };
    },
});

// Tiny router manager
const router = (initialPath, routes) => ({
    path: initialPath || "/",
    routes: routes || {},
    // Get the current path
    get: function () {
        return this.path;
    },
    // Set the current path
    set: function (path) {
        this.path = path.trim(); // Update current path
        const url = new URL(this.path, "https://localhost");
        const req = {
            "pathname": url.pathname,
            "query": url.searchParams,
            "params": {},
        };
        const items = splitUrl(req.pathname);
        const route = Object.keys(this.routes).find(routePattern => {
            const params = {}; // To store path params
            const patternItems = splitUrl(routePattern);
            if (items.length !== patternItems.length) {
                return false; // Not valid route
            }
            //Check all pattern items
            for (let i = 0; i < patternItems.length; i++) {
                //Check for dynamic pattern
                if (patternItems[i].charAt(0) === ":" && items[i]) {
                    params[patternItems[i].substring(1)] = items[i];
                }
                else if (patternItems[i] !== items[i]) {
                    return false; // Provided path do not math this route
                }
            }
            //Save the params
            req.params = params;
            return true;
        });
        //Call the listener of this route
        return route && this.routes[route](req);
    },
    //Reload the current route 
    refresh: function () {
        return this.set(this.path);
    },
});

// Split the provided url
const splitUrl = (path) => {
    return path.trim().split("/").filter(p => p.length > 0);
};

// Join the provided paths
const joinUrl = (base, ...segments) => {
    const paths = base.split("/").filter(p => p.length > 0);
    (segments || []).forEach(s => {
        s && typeof s === "string" && paths.push(s.split("/").filter(p => !!p && p !== "." && p !== "..").join("/"));
    });
    // Check if last segment is an object
    const last = (segments || []).length > 0 && segments[segments.length - 1];
    const query = (last && typeof last === "object") ? "?" + new URLSearchParams(last).toString() : "";
    // Return the joined paths
    return "/" + paths.join("/") + query;
};

//HTTP error class
class HTTPError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "HTTPError";
        this.code = code;
    }
};

//Export http module
const http = (url, options) => {
    options = options || {};
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        let body = options.body || null; //Default to empty message
        request.open(options.method || "get", url, true); //Open connection
        //Register load listener --> process response
        request.addEventListener("load", () => {
            //Check for request error
            if (request.status > 299) {
                return reject(new HTTPError(request.status, request.statusText));
            }
            //Build response message
            const response = {
                //ok": request.status < 300,
                "statusText": request.statusText,
                "statusCode": request.status,
                "url": request.responseURL,
                "raw": request, //Raw response data
                "headers": {},
                //Response parsers
                "text": () => Promise.resolve(request.responseText),
                "json": () => Promise.resolve(request.responseText).then(JSON.parse),
                "blob": () => Promise.resolve(new Blob([request.response])),
            };
            //Parse all the headers and save to the headers object
            request.getAllResponseHeaders().split(/[\r\n]+/).forEach(line => {
                const items = line.split(": ");
                if (items.length === 2) {
                    response.headers[items[0].toLowerCase().trim()] = items[1].trim();
                }
            });
            //Submit response
            return resolve(response);
        });
        //Register error listener
        request.addEventListener("error", reject);
        //Assign the headers to the request
        Object.keys(options.headers || {}).forEach(key => {
            return request.setRequestHeader(key.toLowerCase(), options.headers[key]);
        });
        //Check for JSON data to upload --> serialize as string and set json content-type header
        if (typeof options.json === "object") {
            body = JSON.stringify(options.json); //Convert json data to string
            request.setRequestHeader("content-type", "application/json");
        }
        //Check for form object --> serialize as query-string and set form header
        else if (typeof options.form === "object") {
            // body = buildQueryString(options.form); //convert to query-string
            body = new URLSearchParams(options.form).toString();
            request.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        }
        //Check for formdata object provided
        else if (options.formData) {
            //Don't add the content-type header --> https://stackoverflow.com/a/5976031
            //xhttp.setRequestHeader("content-type", "multipart/form-data");
            body = options.formData;
        }
        //Add credentials to request (cookies, ...)
        //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        request.withCredentials = options.credentials === true;
        //Send the request
        return request.send(body);
    });
};

// Register some HTTP aliases to automatically convert http responses
Object.assign(http, {
    text: (url, opt) => http(url, opt).then(res => res.text()),
    json: (url, opt) => http(url, opt).then(res => res.json()),
    blob: (url, opt) => http(url, opt).then(res => res.blob()),
});

// Download the provided file content
const downloadFile = (name, content) => {
    const link = render(null, element("a", {
        "download": name || "",
        "href": content,
    }));
    return link.click();
};

// Promised file reader
// Available methods: readAsArrayBuffer, readAsBinaryString, readAsDataURL, readAsText
const readFile = (file, method) => {
    method = method || "readAsText"; // By default read as text
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.addEventListener("load", e => resolve(reader));
        reader.addEventListener("error", e => reject(e));
        reader[method](file); // Read the file
    });
};

// Slice a blob in chunks of the provided size, and call a function for each chunk.
// Returns a promise that resolves if all chunks have been processed and rejects if there was an error processing a chunk
const chunks = (b, size, fn) => {
    size = size || 1048576; // Default file size is 1Mb 
    const total = Math.ceil(b.size / size); //Total number of chunks
    return new Promise ((resolve, reject) => {
        const processNextChunk = index => {
            if (index >= total) {
                return resolve();
            }
            // Prepare the next chunk
            const start = index * size;
            const end = Math.min(start + size, b.size);
            const blob = b.slice(start, end);
            return fn({index, start, end, blob, total})
                .then(() => processNextChunk(index + 1))
                .catch(reject);
        };
        // Initialize the chunk processing
        processNextChunk(0);
    });
};

// Export timeout wrapper
// Executes the callback at the provided timeout
// If no callback is provided, returns a promise that resolves at the given delay time
const delay = (timeout, callback) => {
    // Check for callback method provided
    if (typeof callback === "function") {
        return setTimeout(callback, timeout);
    }
    // Otherwise: return a promise that resolves at the specified time
    return new Promise(resolve => {
        return setTimeout(resolve, timeout);
    });
};

// Generates a unique random string of 15 chracters.
// tempid(); // -> "wv1ufiqj5e6xd3k"
const tempid = () => {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
};

// Returns a formatted timestamp. The `pattern` argument is a string where the following matches will be replaced:
// -`YYYY`: replaced with the current full year.
// - `MM`: replaced with the current month.
// - `DD`: replaced with the current day.
// - `hh`: replaced with the current hours.
// - `mm`: replaced with the current minutes.
// - `ss`: replaced with the current seconds.
//
// kofi.timestamp("Current year: YYYY")
// // -> "Current year: 2018"
//

// Available values
const timestampValues = ["YYYY", "MM", "DD", "hh", "mm", "ss"];
const currentDateRegex = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).\d\d\dZ/g;

// Parse the provided pattern and return the wanted timestamp
const timestamp = (pattern, date) => {
    pattern = pattern || "YYYY-MM-DD hh:mm:ss";
    const result = {};
    const current = currentDateRegex.exec((date || new Date()).toJSON());
    if (current === null || current.length < 7) {
        return pattern;
    }
    for (let i = 0; i < timestampValues.length; i++) {
        //The first element is the full matched string
        result[timestampValues[i]] = current[i + 1];
    }
    const regex = new RegExp("(" + timestampValues.join("|") + ")", "g");
    return pattern.replace(regex, match => {
        return ("0000" + result[match]).slice(-match.length);
    });
};

// Map special chars to html codes
const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "(": "&#40;",
    ")": "&#41;",
    "[": "&#91;",
    "]": "&#93;"
};

// Escape html >> converts '<', '>', '&', '"' and "'" chars to html codes
const escapeHtml = unsafe => {
    return unsafe.replace(/[&<>"'()[\]]/g, match => htmlEscapes[match]);
};

// Replace all handlebars expressions from `str` with values of `obj`.
// format("My car is {{ color }}!", { color: 'blue' }); // --> "My car is blue!"
const format = (str, obj) => {
    return !obj ? str : str.replace(/\{\{\s*([^{}\s]+)\s*\}\}/g, (match, key) => {
        return obj[key] ? obj[key].toString() : match;
    });
};

// Retry the specified function until it returns a non rejected Promise
const retry = (times, fn) => {
    times = Math.abs(times) || 1;
    return new Promise((resolve, reject) => {
        let firstError = null;
        const iteratorFn = current => {
            if (current >= times) {
                return reject(firstError);
            }
            fn(current).then(resolve).catch(error => {
                // Only save the first error message
                firstError = firstError || error;
                iteratorFn(current + 1); // Try again
            });
        };
        // Start loop
        iteratorFn(0);
    });
};

// Async iterates over an `array` or an `object`.
const each = (items, fn) => {
    items = items || [];
    return new Promise((resolve, reject) => {
        const entries = Array.isArray(items) ? items : Object.entries(items);
        const entriesIterator = index => {
            if (index >= entries.length) {
                return resolve(); //End the each
            }
            // Call the function with the current value
            fn(entries[index], index)
                .then(() => entriesIterator(index + 1))
                .catch(reject);
        };
        //Start the each loop
        entriesIterator(0);
    });
};

// Conditional as a function
const when = (condition, fn) => !!condition ? fn() : null;

// Parse a classnames list
const parseClassNames = items => {
    if (typeof items === "string") {
        return items.split(" ").filter(item => item.length);
    }
    else if (Array.isArray(items)) {
        return items.filter(item => typeof item === "string" && item.length); 
    }
    else if (typeof items === "object") {
        return Object.keys(items || {}).filter(key => !!items[key]);
    }
    //Over value --> return an empty array
    return [];
};

//Join class names
const classNames = (...args) => {
    return (args || []).map(arg => parseClassNames(arg)).flat().join(" ");
};

// Tiny debounce implementation to reduce the number of timmes the function is called
const debounce = (wait, fn) => {
    let timer = null;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(fn, wait || 25);
    };
};

// Global kofi object
const kofi = {
    element,
    render,
    stringify,
    app,
    ready,
    http,
    classNames,
    each,
    retry,
    when,
    timestamp,
    format,
    delay,
    tempid,
    store,
    dispatch,
    escape,
    unescape,
    escapeHtml,
    router,
    joinUrl,
    splitUrl,
    readFile,
    downloadFile,
    chunks,
    debounce,
};

// Default export
export default kofi;
