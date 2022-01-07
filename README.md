<h1 align="center">kofi.js</h1>

<div align="center">
<b>kofi</b> is a micro browser toolkit for building modern <b>frontend applications</b>. 
</div>
<br>
<div align="center">
<img src="https://img.shields.io/npm/v/kofi.svg">
<img src="https://img.shields.io/badge/status-on_development-orange.svg">
<img src="https://img.shields.io/badge/stability-experimental-orange.svg">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
</div>

## Installation

You can add **kofi** to your project using NPM:

```
$ npm install --save kofi
```

## Getting started

The **kofi** package can be used via modules:

```html
<script type="module">
    import kofi from "https://unpkg.com/kofi/kofi.js";
</script>
```

## Usage

You can create an application with **kofi** using `kofi.app`. This function needs:

- A `parent` DOM element to render the application.
- A `fn` function to generate the application.


```javascript
const parent = document.getElementById("root");
const app = kofi.app(parent, actions => {
    const [count, setCount] = actions.useState(0);
    const handleClick = () => {
        return setCount(count + 1);
    };
    // Return counter
    return kofi.element("div", {}, 
        kofi.element("div", {}, `Count: ${count}`),
        kofi.element("button", {"onclick": handleClick}, "Increment")
    );
});
```


### Actions

The second argument of `kofi.app` is a function that must return a `kofi.element` that will be rendered in the DOM. This function will be called with a single argument, that contains a collection of useful actions for your application: application lifecycle, state management, routing, and more!

#### actions.useProp

This action will return a prop value (if exists). The first argument is the prop name and the second argument is a default value if this prop has not provided.

```javascript
const value = actions.useProp("count", 0);
```

#### actions.useState

An action to get and update state values in the application. This function accepts the initial state, and returns an array where the first entry is the current state value and the second entry is a function to update the state and trigger an application update.

```javascript
const [count, setCount] = actions.useState(0);
```

#### actions.useStore

An action that will generate a `kofi.store` instance. This action is similar to the `actions.useState`, but the initial state must be always an object. This action is useful when your application needs to save complex states.

```javascript
const [store, setStore] = actions.useStore({
    name: "Bob",
    email: "bob@email.com",
});
```

#### actions.forceUpdate

This action forces a re-render of the application.



## API

### kofi.app(parent, fn)

Generates a new application instance.


### kofi.ready(fn)

Executes the provided function `fn` when the DOM becomes ready. This utility is similar to [jQuery's ready method](https://api.jquery.com/ready/).

```javascript 
//Execute this function when the DOM is ready
kofi.ready(() => {
    console.log("DOM is ready");
});
```

### kofi.element(type, props[, ...children])

Creates a new VDOM Node element of the specified `type`, with the specified `props` and `children`.

```javascript
kofi.element("div", {"align": "center"}); // --> <div align="center"></div>

kofi.element("div", {}, "Hello world"); // --> <div>Hello world</div>
```

This method does not return a DOM element. It returns a Virtual DOM Node element, which is a JSON representation of the DOM element. 

To transform it into a real DOM element, use `kofi.render`.

#### Type

The `type` argument can be either a tag name string (such as `"div"` or `"a"`) or a function.

```javascript
//Using a tag name
kofi.element("a", {"href": "https://google.es"}, "Click me!"); 
//Renders to: <a href="https://google.es">Click me!</a>

//Using a function
const Welcome = (props, children) => {
    return kofi.element("span", {}, `Hello ${props.name}`);
};

kofi.element(Welcome, {"name": "Bob"}); 
//Renders to: <span>Hello Bob</span>
```

#### Props

The `props` argument is an object with the data of the element. This can include HTML attributes, events listeners or custom properties that our functional element will use.

```javascript
kofi.element("div", {
    "className": "button",
    "onclick": event => { /* Handle click event */ },
    "id": "button1",
});
```

##### Class names

Use the `className` property to set the CSS class.

```javascript
kofi.element("div", {"className": "button"}, "Button");
```

##### Events

Attach a callback listener to an event.

```javascript
kofi.element("div", {
    "onclick": event => { /* Handle click event */ },
    "onmousedown": event => { /* Handle mouse down event */ },
    "onmouseup": event => { /* Handle mouse up event */ },
});
```

##### Styles

You can provide an object with the style of the element. All styles attributes should be in camel-case format.

```javascript
kofi.element("div", {
    "style": {
        "backgroundColor": "blue",
        "color": "white",
    },
    "align": "center"
}, "Hello");
```


#### Use it with JSX

You can use the babel's plugin [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) for creating DOM elements using JSX. 

This example using JSX: 

```jsx
/** @jsx kofi.element */
import kofi from "kofi";

const user = (
    <div>
        <img className="avatar" src="/path/to/user.png" />
        <span>Hello user</span>
    </div>
);
```

Compiles to:

```javascript
/** @jsx kofi.element */
const kofi = require("kofi");

const user = kofi.element("div", null, 
    kofi.element("img", {"className": "avatar", "src": "/path/to/user.png"}),
    kofi.element("span", null, "Hello user"),
);
```

### kofi.render(parent, element)

Renders a VDOM Node to the DOM.

```javascript
const el = kofi.element("div", {}, "Hello world!");

kofi.render(document.getElementById("root"), el);
```

The first argument is the parent DOM element, and the second arguments is the VDOM Node to render. Returns a reference to the rendered DOM element.


### kofi.http(url [, options])

Performs a request to the specified url, and returns a promise that:
- resolves if the request has been successful executed, with a response object.
- rejects if there was an error performing the request.

The additional `options` argument is an object with all the options to perform the request. The following entries are allowed: 

- `method`: a string with the http method. Default is `"get"`.
- `headers`: an object with the HTTP headers. Default is `{}`.
- `body`: a string data to be sent with the request (not allowed in GET requests). 
- `json`: an object or array to send as the `body`. It will add the `Content-type: application/json` header to the request.
- `form`: an object that will be encoded as a query string and sent as the `body`. It will add the `Content-type: application/x-www-form-urlencoded` header to the request.
- `formData`: an instance of [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) with the data to perform a `multipart/form-data` request. 
- `credentials`: a boolean to specify if credentials should be included in the request.

#### Response schema

The response of the request will have the following schema:

```javascript
{
    // statusCode: a number with the HTTP response status code
    "statusCode": 200,
    
    // statusText: a string with the HTTP response status message
    "statusText": "OK",
    
    // url: a string with the request url
    "url": "/test",

    // raw: the response object returned by XMLHttpRequest
    "raw": {},
    
    // headers: a parsed object with the response headers
    "headers": {},
}
```

In addition to this, the following methods will be provided in the response object:

- `response.text()`: returns a promise that resolves with a text representation of the response body.

- `response.blob()`: returns a promise that resolves with a Blob representation of the response body.

- `response.json()`: returns a promise that resolves with the result of parsing the response body text as a JSON.


#### Basic example

```javascript
kofi.http("/data.json").then(response => {
    console.log("Status code: " + response.statusCode);
    // Process the response as JSON
    return response.json();
}).then(data => {
    // Parse JSON data
    console.log(data);
}).catch(error => {
    // Something went wrong
});
```

#### Sending JSON object

```javascript
kofi.http("/register", {
    "method": "put", 
    "json": {
        "name": "Bob",
        "password": "12345"
    }
}).then(response => {
    // Process response
}).catch(error => {
    // /something went wrong
});
```

#### application/x-www-form-urlencoded 

Use the `form` option to send URL-encoded forms: 

```javascript
kofi.http("/users", {
    "method": "post", 
    "form": {
        "name": "Bob",
        "age": "30",
        "city": "New York"
    }
}).then(response => {
    // Process response
}).catch(error => {
    // /something went wrong
});
```

#### multipart/form-data

Use the `formData` option to send `multipart/form-data` forms. Check the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface documentation for more information.

```javascript 
const formData = new FormData();
formData.append("username", "Bob"); //Append values
formData.append("userpic", fileInput.files[0], "avatar.jpg"); //Append files

//Send to the server
kofi.http("/upload", {
    "method": "post", 
    "formData": formData
}).then(response => {
    // Process response
}).catch(error => {
    // /something went wrong
});
```


### kofi.dispatch()

Generates a new event dispatcher.

```javascript 
const dispatcher = kofi.dispatch();
```

#### dispatcher.on(name, listener)

Registers a new `listener` function to the event called `name`.

```javascript 
dispatcher.on("error", message => {
    console.log("New error generated: " + message);
});
```

#### dispatcher.off(name, listener)

Removes the specific `listener` function from the event called `name`.

#### dispatcher.dispatch(name[, args...])

Trigger all listeners of the event called `name`. All the extra arguments passed to this function will be passed to all registered listeners.

```javascript
dispatcher.dispatch("error", "Error importing file xxxx.json");
```

### kofi.store(initialState)

Generates a tiny store manager. The `initialState` is an object containing the initial state.

```javascript
const store = kofi.store({
    "count": 0,
});
```

#### store.get()

Returns the current state.

#### store.subscribe(listener)

Register a listener wich is called when store is updated.

```javascript
store.subscribe(newState => {
    // State has been updated
});
```

#### store.update(arg)

Updates the current state. The `arg` value can be an object containing the new state, that will be merged with the previous state using `Object.assign`:

```javascript
store.update({
    "count": 1,
});
```

Also, you can pass a function that will recieve the current state, and must return an object with the new state that will be merged with the previous state using `Object.assign`:

```javascript
store.update(prevState => {
    return {
        "count": prevState + 1,
    };
});
```

After merge is done, all listeners registered with `store.subscribe` will be called.


### kofi.router(initialPath, routes)

Generates a tiny router that you can use to execute functions when the path matches the route path. The following arguments are required to generate a router:

- `initialPath`: the router initial path, for example `"/"`.
- `routes`: an object whose keys are the route strings and values are a function that will be called when the route path string matches the current path.

```javascript
const router = kofi.router("/", {
    "/": req => {
        return console.log("Home");
    },
    "/about": req => {
        return console.log("About page");
    },
});
```

#### router.get()

Returns the lastly resolved routing path.

#### router.set(newPath)

Redirects to the matching route, executing the function bound to the route string.


### kofi.each(items, fn)

Async iterates over an `array` or an `object` and returns a new promise that resolves if all items has been processed, or rejects if there was an error processing an item.

- `items`: `array` or `object` you want to iterate.
- `fn`: function that will be called with each item of the `items` array or object, and must return a promise that should resolve to continue with the next item, and reject to abort the each function.

```javascript
//Iterate over an array 
kofi.each([1, 2, 3], (value, index) => {
    console.log(index + " -> " + value);
    return Promise.resolve();
});
// 0 -> 1
// 1 -> 2
// 2 -> 3

//Iterate over an object 
kofi.each({"key1": "value1", "key2": "value2"}, ([key, value]) => {
    console.log(key + " -> " + value);
    return Promise.resolve();
});
// key1 -> value1
// key2 -> value2
```

### kofi.retry(times, fn)

Retry the specified `fn` function up to `times` until it returns a resolved promise.

```javascript
kofi.retry(5, () => {
    // This function can be executed up to 5 times
    // Until it returns a resolved promise
}).then(() => {
    // Success
}).catch(error => {
    // error is the first error returned by the function
});
```

### kofi.timestamp(pattern)

Returns a formatted timestamp. The `pattern` argument is a string where the following matches will be replaced:

- `YYYY`: replaced with the current full year.
- `MM`: replaced with the current month.
- `DD`: replaced with the current day.
- `hh`: replaced with the current hours.
- `mm`: replaced with the current minutes.
- `ss`: replaced with the current seconds.

```javascript
kofi.timestamp("Current year: YYYY")
// -> "Current year: 2018"
```

### kofi.format(str, obj)

Replace all handlebars expressions from `str` with values of `obj`.

```javascript
kofi.format('My car is {{ color }}!', { color: 'blue' }); // --> "My car is blue!"
```

### kofi.tempid()

Generates a unique random string of 15 characters.

```javascript
kofi.tempid();  // -> str = "wv1ufiqj5e6xd3k"
```

### kofi.delay(time, fn)

This is just [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) 
but with the arguments reversed (first the delay `time` in ms, then the callback `fn` function).

```javascript
kofi.delay(1000, () => {
    console.log("Hello after 1 second!!");
});
```

### kofi.classNames(...)

A tiny utility for conditionally joining classNames. This function takes any number of arguments which can be an string, an object or an array. When providing an object, if the value associated with a given key is truthly, that key will be included in the generated classNames string. Non string values will be also ignored.

```javascript
kofi.classNames("foo", "bar"); // -> "foo bar"
kofi.classNames("foo", null, false, "bar"); // -> "foo bar"
kofi.classNames("foo", ["bar", null]); // -> "foo bar"
kofi.classNames({
    "foo": true,
    "bar": false,
}); // -> "foo"
```

### kofi.when(condition, fn)

Executes the specified `fn` function when the `condition` arguments is a truthy value.

```javascript
const condition = /* condition */;
kofi.when(condition, () => {
    // This function will be executed if `condition` is a truthy value
});
```

### kofi.downloadFile(name, path)

Download a file from the browser. The first argument is the filename and the second argument is the file url to download. 

```javascript
const data = JSON.stringify({
    "key1": true,
    "key2": false,
});

// Generate the Url to download the file
const url = URL.createObjectURL(new Blob([data], {
    type: "application/json",
}));

// Download the file
kofi.downloadFile("data.json", url);
```


## License

**kofi** is released under the [MIT LICENSE](./LICENSE).

