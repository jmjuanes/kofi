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

**kofi** is written using **ES2015 Modules**. You can import **kofi** into your ES2015 application as a namespace or importing specific methods from **kofi**:

```javascript
//Import the whole kofi package as a namespace
import kofi from "kofi";

//Import only specific methods
import {request, dispatch} from "kofi";
```

**kofi** can be also imported directly in your browser:

```html
<script type="text/javascript" src="./node_modules/kofi/dist/kofi.umd.js"></script>
```


## API

### kofi.ready(fn)

Executes the provided function `fn` when the DOM becomes ready. This utility is similar to [jQuery's ready method](https://api.jquery.com/ready/).

```javascript 
//Execute this function when the DOM is ready
kofi.ready(function () {
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
let Welcome = function (props, children) {
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
    "onclick": function (event) { /* Handle click event */},
    "id": "button1"
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
    "onclick": function (event) { /* Handle click event */},
    "onmousedown": function (event) { /* Handle mouse down event */},
    "onmouseup": function (event) { /* Handle mouse up event */}
});
```

##### Styles

You can provide an object with the style of the element. All styles attributes should be in camel-case format.

```javascript
kofi.element("div", {
    "style": {
        "backgroundColor": "blue",
        "color": "white"
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

let user = (
    <div>
        <img className="avatar" src="/path/to/user.png" />
        <span>Hello user</span>
    </div>
);
```

Compiles to:

```javascript
/** @jsx kofi.element */
let kofi = require("kofi");

let user = kofi.element("div", null, 
    kofi.element("img", {"className": "avatar", "src": "/path/to/user.png"}),
    kofi.element("span", null, "Hello user")
);
```

### kofi.render(parent, element)

### kofi.mount(parent, component, props)


### kofi.request(options)

Performs a request to the specified url in the `options` object, and returns a new Promise that resolves if the request has been successful executed, or rejects if there was an error performing the request.

The `options` argument is an object with all the options to perform the request. The following entries are allowed: 

- `url` **mandatory**: a string with the url. This is the only mandatory field of the options object.
- `method`: a string with the http method. Default is `"get"`.
- `headers`: an object with the HTTP headers. Default is `{}`.
- `body`: a string data to be sent with the request (not working with GET requests). If the `json` option is set to `true`, `body` must be a valid JSON object that will be converted to string using `JSON.stringify`.
- `json`: if set to `true`, the request body is serialized as a JSON and adds the `Content-type: application/json` header to the request. It also evaluates the response body as a JSON and returns a JSON object instead of a string. Default is `false`.
- `form`: if an object is passed on this option, the request body is set to it's query-string representation. It also adds the `Content-type: application/x-www-form-urlencoded` header to the request.
- `formData`: an instance of [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) with the data to perform a `multipart/form-data` request. 
- `processData`: set to `false` to send non-process data with the request (data passed with the `form` option won't be serialized as a query-string, and the body won't be serialized as a JSON when the `json` option is set to `true`). Default is `true`.
- `validateStatus`: a function to define if the request should be resolved or rejected for a given HTTP response status code. If this method returns `true`, the promise will be resolved. By default, all status >= 300 will be rejected. 

#### Response schema

The response of the request will have the following schema:

```javascript
{
    // error: an instance of `Error` if something went wrong doing the request of parsing the response, 
    // or an instance of `kofi.HTTPError` if the request has been rejected using the validateStatus option.
    // If the promise has been resolved, this field will be `null`.
    "error": null,
    
    // statusCode: a number with the HTTP response status code
    "statusCode": 200,
    
    // statusMessage: a string with the HTTP response status message
    "statusMessage": "OK",
    
    // method: a string with the request method
    "method": "get",

    // url: a string with the request url
    "url": "/test",
    
    // headers: a parsed object with the response headers
    "headers": {},

    // body: the response body string or object (if the `json` option is provided).
    "body": null
}
```

#### Basic example

```javascript
//Import a JSON file
let request = kofi.request({
    "method": "get", 
    "url": "./data.json", 
    "json": true,
    "validateStatus": function (code) {
        return code < 300;
    }
});

//Request has been resolved
request.then(function (response){
    //Print the response status code
    console.log("Status code: " + response.statusCode);
    //Print the result
    console.log(response.body);
});

//Request has been rejected --> response.error contains the error
request.catch(function (response) {
    console.log(response.error);
});
```

#### Sending JSON object

```javascript
let request = kofi.request({
    "url": "/register", 
    "method": "put", 
    "json": true, 
    "body": {
        "name": "Bob",
        "registered": false,
        "password": "12345"
    }
});
```

#### application/x-www-form-urlencoded 

Use the `form` option to send URL-encoded forms: 

```javascript
let request = kofi.request({
    "url": "/my/service", 
    "method": "post", 
    "form": {
        "name": "Bob",
        "age": "30",
        "city": "New York"
    }
});
```

#### multipart/form-data

Use the `formData` option to send `multipart/form-data` forms. Check the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface documentation for more information.

```javascript 
let formData = new FormData();
formData.append("username", "Bob"); //Append values
formData.append("userpic", fileInput.files[0], "avatar.jpg"); //Append files

//Send to the server
let request = kofi.request({
    "url": "/process/uploads",
    "method": "post", 
    "formData": formData
});
```


### kofi.dispatch()

Generates a new event dispatcher.

```javascript 
let dispatcher = kofi.dispatch();
```

#### dispatcher.addListener(name, listener)

Registers a new `listener` function to the event called `name`.

```javascript 
dispatcher.addListener("error", function (message) {
    console.log("New error generated: " + message);
});
```

#### dispatcher.removeListener(name, listener)

Removes the specific `listener` function from the event called `name`.

#### dispatcher.removeAllListeners(name)

Removes all listeners of the event called `name`.

#### dispatcher.emit(name[, args...])

Trigger all listeners of the event called `name`. All the extra arguments passed to this function will be passed to all registered listeners.

```javascript
dispatcher.emit("error", "Error importing file xxxx.json");
```

### kofi.each(items, fn)

Async iterates over an `array` or an `object` and returns a new promise that resolves if all items has been processed, or rejects if there was an error processing an item.

- `items`: `array` or `object` you want to iterate.
- `fn`: function that will be called with each item of the `items` array or object with the following arguments: 
  - First argument: the property name if `items` is an object, or the index if `items` is an array.
  - Second argument: the property value if `items` is an object, or the value if `items` is an array.
  - Last argument: a `next` function. 

Calling the `next` function invokes the next item. If you pass anything to the `next` function, this will be treated as an error, the each loop will be stopped and the promise will be rejected.

```javascript
//Iterate over an array 
kofi.each([1, 2, 3], function (index, value, next) {
    console.log(index + " -> " + value);
    return next();
});
// 0 -> 1
// 1 -> 2
// 2 -> 3

//Iterate over an object 
kofi.each({"key1": "value1", "key2": "value2"}, function (key, value, next) {
    console.log(key + " -> " + value);
    return next();
});
// key1 -> value1
// key2 -> value2
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

### kofi.values(obj)

Returns an array of a given object's own enumerable property values. It's a ponyfill of the [ `Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) method.

```javascript
let obj = {
    a: 1,
    b: 2,
    c: "hello"
};
let values = kofi.values(obj); // -> values = [1, 2, "hello"]
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

### kofi.parseQueryString(str)

Parse a query string into an object. Leading `?` is ignored.

```javascript
kofi.parseQueryString("foo=1&bar=2"); // {"foo": "1", "bar": "2"}
```

### kofi.buildQueryString(obj)

Stringify an object into a query string.

```javascript
kofi.buildQueryString({"foo": "1", "bar": "2"}); // "foo=1&bar=2"
```

### kofi.delay(time, fn)

This is just [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) 
but with the arguments reversed (first the delay `time` in ms, then the callback `fn` function).

```javascript
kofi.delay(1000, function () {
    console.log("Hello after 1 second!!");
});
```

## License

**kofi** is released under the [MIT LICENSE](./LICENSE).

