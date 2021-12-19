<h1 align="center">kofi.js</h1>

<div align="center">
<b>kofi</b> is a micro browser utility library for building modern <b>frontend applications</b>. 
</div>
<br>
<div align="center">
<img src="https://david-dm.org/jmjuanes/kofi/dev-status.svg?style=flat-square">
<img src="https://img.shields.io/badge/status-on_development-orange.svg?style=flat-square">
<img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square">
<img src="https://img.shields.io/npm/v/kofi.svg?style=flat-square">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
</div>

## Installation

You can add **kofi** to your project using NPM:

```
$ npm install --save kofi
```

## Getting started

**kofi** is written using **ES2015 Modules**. You can import **kofi** into your ES2015 application:

```javascript
import kofi from "kofi";
```

**kofi** can be also imported directly in your browser:

```html
<script type="text/javascript" src="./node_modules/kofi/kofi.umd.js"></script>
```


## API

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


### kofi.component(spec)

This method creates and validates a new kofi component.

```javascript
let Counter = kofi.component({
    "oninit": function () {
        this.state = {"count": 0};
    },
    "handleClick": function () {
        return this.update({"count": this.state.count + 1});
    },
    "render": function () {
        return kofi.element("div", {}, 
            kofi.element("div", {}, `Count: ${this.state.count}`),
            kofi.element("button", {"onclick": this.handleClick}, "Increment")
        );
    }
});
```

A kofi component is just an object with a `render` method. This method should return a new `kofi.element` that will be rendered in the DOM. Each time the component is updated, the `render` method will be invoked, and the new generated VDOM will replace the current DOM. 

#### State and updating

The `state` is an object that holds information about the component that may change over time and is managed only by the component. Each time the state of the component changes, the `render` method of the component will be called again and the DOM will be updated.

Usually the state gets it's initial data in the `oninit()` method. This is the only place where you should update the state manually. 
To update the state, you should use the `update` method. This method accepts two arguments:

- An object with the new state that will be merged with the current state of the component.
- Optionally, a callback method that will be invoked after the component is updated.

The new state will be merged with the current state using `Object.assign`, so you should only pass the new data that has been changed.

```javascript
kofi.component({
    "oninit": function () {
        this.state = {
            "name": "Bob",
            "count": 1
        };
    },
    "handleSomeEvent": function () {
        return this.update({
            "count": this.state.count + 1
        });
    },
    . . .
});
```

If you call `update` without a new state object, the component will be re-rendered without updating the state.


#### Passing data

Data can be passed to the component and will be stored as an object in the `props` field of the component. You can use the initial data passed to the component as props to initialize the state.

Note that you should avoid changing the props object. Instead, store the data that may change in the state object.


#### Component lifecycle

Components can have lifecycle methods, which will be invoked at various points during the lifecycle of your component. 

##### oninit()

This method is invoked before the app is mounted. This is the recommended place to initialize the component state.

```javascript
kofi.component({
    "oninit": function () {
        this.state = {
            "count": 0
        };
    },
    . . .
});
```

**You should not call update() in the oninit() method**. Instead, update the `this.state` object directly in the **oninit()** method.

##### onmount()

This method is invoked immediately after the component is mounted.

##### onupdate()

This method is invoked immediately after updating occurs. This method is not called for the initial render.


### kofi.mount(parent, component, props)

Mounts the result of a `kofi.component` call to the parent DOM element. 
This method is similar to `kofi.render`, but instead of drawing the DOM element once, it will update the DOM element each time the `update` method is called.

For example, let's mount the following component:

```javascript
let Counter = kofi.component({
    "oninit": function () {
        this.state = {"count": this.props.initialValue};
    },
    "handleClick": function () {
        return this.update({"count": this.state.count + 1});
    },
    "render": function () {
        return kofi.element("div", {}, 
            kofi.element("div", {}, `Count: ${this.state.count}`),
            kofi.element("button", {"onclick": this.handleClick}, "Increment")
        );
    }
});

kofi.mount(document.getElementById("root"), Counter, {"initialValue": 0});
```

This will render the first time as follows:

```html
<div>
    <div>Count: 0</div>
    <button>Increment</button>
</div>
```

Each time that the user clicks on the button, the `count` variable will be increment in one unit and the DOM will be updated with the new count value.

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
- `fn`: function that will be called with each item of the `items` array or object with the following arguments: 
  - First argument: the property name if `items` is an object, or the index if `items` is an array.
  - Second argument: the property value if `items` is an object, or the value if `items` is an array.

The `fm` function must return a promise that must resolve to continue with the next item, and reject to abort the each function.

```javascript
//Iterate over an array 
kofi.each([1, 2, 3], (index, value) => {
    console.log(index + " -> " + value);
    return Promise.resolve();
});
// 0 -> 1
// 1 -> 2
// 2 -> 3

//Iterate over an object 
kofi.each({"key1": "value1", "key2": "value2"}, (key, value) => {
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

## License

**kofi** is released under the [MIT LICENSE](./LICENSE).

