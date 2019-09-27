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

### Table of contents

- Dom manipulation:
  - [kofi.createNode](#koficreatenodetype-attr-children)
  - [kofi.createRef](#koficreateref)
- [kofi.ready](#kofireadyfn)
- [kofi.dispatch](#kofidispatch)
- [kofi.queue](#kofiqueue)
- [kofi.request](#kofirequestoptions-callback)
- [kofi.router](#kofirouter)
- [kofi.helpers](#kofihelpers)


### kofi.createNode(type, attr, ...children)

Based on `React.createElement`, this method creates a new DOM Node element of the specified type. 

#### Node type

The `type` argument can be either a tag name string (such as `"div"` or `"a"`) or a function.

#### Node attributes

The `attr` argument can be an object with the attributes of the node or `null` if no attributes will be specified. The attributes object follows the same syntax of React attributes.

#### Use it with JSX

You can use the babel's plugin [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) for creating DOM elements using JSX. 

This example using JSX: 

```jsx
/** @jsx createNode */
import {createNode} from "kofi";

let user = (
    <div>
        <img className="avatar" src="/path/to/user.png" />
        <span>Hello user</span>
    </div>
);
```

Compiles to:

```javascript
/** @jsx createNode */
let createNode = require("kofi").createNode;

let user = createNode("div", null, 
    createNode("img", {"className": "avatar", "src": "/path/to/user.png"}),
    createNode("span", null, "Hello user")
);
```

### kofi.createRef()

Creates a new reference that can be attached to a DOM node to save the reference of this node.

```jsx
/** @jsx createNode */
import {createNode, createRef} from "kofi";

//Referenced node
let inputRef = createRef();

//Submit function
let onSubmit = function () {
    console.log("Your name: " + inputRef.current.value);
};

//Form element
let formNode = (
    <div>
        <label>Type your name: </label>
        <input ref={inputRef} type="text" placeholder="Your name..." />
        <button onClick={onSubmit}>Send</button>
    </div>
);

```

### kofi.ready(fn)

Executes the provided function `fn` when the DOM becomes ready. This utility is similar to [jQuery's ready method](https://api.jquery.com/ready/).

```javascript 
//Execute this function when the DOM is ready
kofi.ready(function () {
    console.log("DOM is ready");
});
```


### kofi.dispatch();

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


### kofi.queue();

Generates a new instance of the queue manager.

```js
let queue = kofi.queue();
```

#### queue.then(handler);

Registers a new function to the functions queue. This function will be called with a `next` argument, that is a function that will pass to the next function defined with `queue.then`.

Note that calling the `next` argument with an error will make that all functions that were added after this function won't run. Also, this will immediately invoke the `queue.catch` function with the error passed to the `next` function.

```javascript
queue.then(function (next) {
    var input = document.getElementById("user-input");
    setTimeOut(function () {
        if (input.value === "") {
            //Abort the queue
            return next(new Error("User input is empty"));
        } 
        //If not, continue with the next registered function
        return next();
    }, 5000);
});
```

#### queue.finish(handler);

Registers the function that will be called when all functions registered with `queue.then` has been executed.

#### queue.catch(handler);

Registers the function that will be called when the functions queue was aborted due to an error. 


### kofi.request(options, callback)

Performs a request to the specified url in the `options` object, and executes the provided `callback` function when the request is done or an error is produced generating the request.

#### `options`

The first argument of `kofi.request` is an object with all the options to perform the request. The following entries are allowed: 

- `url` **mandatory**: a string with the url. This is the only mandatory field of the options object.
- `method`: a string with the http method. Default is `"get"`.
- `headers`: an object with the HTTP headers. Default is `{}`.
- `body`: a string data to be sent with the request (not working with GET requests). If the `json` option is set to `true`, `body` must be a valid JSON object that will be converted to string using `JSON.stringify`.
- `json`: if set to `true`, the request body is serialized as a JSON and adds the `Content-type: application/json` header to the request. It also evaluates the response body as a JSON and returns a JSON object instead of a string. Default is `false`.
- `form`: if an object is passed on this option, the request body is set to it's query-string representation. It also adds the `Content-type: application/x-www-form-urlencoded` header to the request.
- `formData`: an instance of [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) with the data to perform a `multipart/form-data`request. 
- `processData`: set to `false` to send non-process data with the request (data passed with the `form` option won't be serialized as a query-string, and the body won't be serialized as a JSON when the `json` option is set to `true`). Default is `true`.
- `auth`: an object with the credentials to authenticate users. Only `basic` or `bearer` authentication schemes are supported. Default is `{}`. 

#### `callback` 

The callback function. This function will get three arguments: 

- `error`: an instance of `Error` if something went wrong doing the request of parsing the response, or an instance of `kofi.HTTPError` if the request returns non-200 status codes (feature added in **v0.2.0**).
  - On `v0.2.0`, non-200 status codes will be treated as errors. 
- `response` an object with the basic information about the generated response. This object will contain the following entries: 
  - `statusCode`: a number with the HTTP response status code. For example, `404`.
  - `statusMessage`: a string with the HTTP response status message. For example, `Not found`.
  - `method`: a string with the request method. 
  - `url`: a string with the request url.
  - `headers`: a parsed object with the response headers.
  - `rawHeaders`: an array with the raw response headers.
- `body`: the response body string or object (if the `json` option is provided).


#### Basic example

```javascript
//Import a JSON file
kofi.request({method: "get", url: "./data.json", json: true}, function (error, response, body){
    //Check for error processing the request 
    if (error) {
        return console.error(error.message);
    } 
    //Print the response status code
    console.log("Status code: " + response.statusCode);
    //Print the result
    console.log(body);
});
```

#### Sending JSON object

```javascript
let obj = {
    "name": "Bob",
    "registered": false,
    "password": null
};
kofi.request({url: "/register", method: "put", json: true, body: obj}, function (error, res, body) {
    /* ... */
}); 
```

#### application/x-www-form-urlencoded 

Use the `form` option to send URL-encoded forms: 

```javascript
let form = {
    "name": "Bob",
    "age": "30",
    "city": "New York"
};
kofi.request({url: "/my/service", method: "post", form: form}, function (error, res, body) {
    /* ... */
});
```

#### multipart/form-data

Use the `formData` option to send `multipart/form-data` forms. Check the [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface documentation for more information.

```javascript 
let formData = new FormData();

//Append key/value pains
formData.append("username", "Bob");

//Append files
formData.append("userpic", fileInput.files[0], "avatar.jpg");

//Send to the server
kofi.request({url: "/process/uploads", method: "post", formData: formData}, function (error, res, body) {
    /* do your magic with the response */
});
```


### kofi.router

A minimal client-side router utility.

```javascript 
//Register single routes
kofi.router.add("/foo", function () {
    console.log("Enter to foo");
});

//Register routes with params
kofi.router.add("/foo/:bar", function (req) {
    console.log("Bar is " + req.params.bar);
});

//Read query parameters
kofi.router.add("/bar", function (req) {
    console.log("Name: " + req.query.name);
});

//Catch all route
kofi.router.add(function (req) {
    console.log("NOT FOUND!");
});
```

#### kofi.router.add(path, listener)

Registers a new listener for the route `path`. The listener receives an object with the request information: 

- `path`: a string with the full matched url.
- `pathname`: a string with the matched url without the query segment (the part after que question mark).
- `query`: an object with all the parsed querystring parametes extracted from the matched path. Default is an empty object `{}`.
- `params`: an object with all the dynamic parts of the matched path. Default is an empty object `{}`.

```javascript
kofi.router.add("/", function (req) {
    console.log("Path: " + req.path);
    console.log("Pathname: " + req.pathname);
    console.log("Querystring values: ");
    Object.keys(req.query).forEach(function (key) {
        console.log("  " + key + " -> " + req.query[key]);
    });
    console.log("Params: ");
    Object.keys(req.params).forEach(function (key) {
        console.log("  " + key + " -> " + req.params[key]);
    });
});
```

If the provided `path` string is a catch-all path (`"*"`), the `listener` function will also receive a function to continue with the search of the route that matches the path.

```javascript
kofi.router.add("*", function (req, next) {
    console.log("New request --> " + req.pathname);
    return next();
});
```

Note that the order of how the routes are defined is important, so you should define the catch-all routes first.

#### kofi.router.set(url)

Call a handler for the provided `url` string.

#### kofi.router.refresh()

Call again the handler for the last url used with `kofi.router.set`.

#### kofi.router.get()

Returns the current hasbang navigation url. 

```javascript
// Current url: localhost#!/foo/bar
kofi.router.get(); // --> "/foo/bar"
```

#### kofi.router.listen()

Starts the router listening for hashbang changes.


### kofi.helpers

Utility functions for working with arrays, numbers, objects and strings.

#### kofi.helpers.delay(time, fn)

This is just [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) but with the arguments reversed (first the delay `time` in ms, then the callback `fn` function).

```javascript
kofi.helpers.delay(1000, function () {
    console.log("Hello after 1 second!!");
});
```

#### kofi.helpers.each(array, fn)

Iterates over an `array` or an `object`.

- `items`: `array` or `object` you want to iterate.
- `fn`: function that will be called with each item of the `items` array or object with the following arguments: 
  - First argument: the property name if `items` is an object, or the index if `items` is an array.
  - Second argument: the property value if `items` is an object, or the value if `items` is an array.

You can stop the iteration by returning `false` in the iterator function

```javascript
//Iterate over an array 
kofi.helpers.each([1, 2, 3], function (index, value) {
    console.log(index + " -> " + value);
});
// 0 -> 1
// 1 -> 2
// 2 -> 3

//Iterate over an object 
kofi.helpers.each({"key1": "value1", "key2": "value2"}, function (key, value) {
    console.log(key + " -> " + value);
});
// key1 -> value1
// key2 -> value2
```

#### kofi.helpers.timer(time, fn)

This is just [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) but with the arguments reversed (first the delay `time` in ms and then the callback `fn` function).

```javascript
let counter = 0;
kofi.helpers.timer(1000, function () {
    counter = counter + 1;
    console.log(counter);
});
```

#### kofi.helpers.timestamp(pattern)

Returns a formatted timestamp. The `pattern` argument is a string where the following matches will be replaced:
- `YYYY`: replaced with the current full year.
- `MM`: replaced with the current month.
- `DD`: replaced with the current day.
- `hh`: replaced with the current hours.
- `mm`: replaced with the current minutes.
- `ss`: replaced with the current seconds.

```javascript
kofi.helpers.timestamp("Current year: YYYY")
// -> "Current year: 2018"
```

#### kofi.helpers.concat(array[, *values])

Returns a new array concatenating `array` with other arrays or values passed.

```javascript
kofi.helpers.concat([1, 2, 3, 4], [5, 6], [7]); // -> [1, 2, 3, 4, 5, 6, 7]

kofi.helpers.concat([1], 2, [3, 4], null); // -> [1, 2, 3, 4, null]
```

#### kofi.helpers.fill(length, value)
Returns a new array with size `length` filled with `value`. Only `string` or `number` values are allowed. 

```javascript
//Fill an array with a number
kofi.helpers.fill(5, 0); // -> [0, 0, 0, 0, 0]

//Fill an array with a string
kofi.helpers.fill(3, "abc"); // -> ["abc", "abc", "abc"]
```

#### kofi.helpers.max(array)

Returns the maximum value in `array`. 

```javascript
kofi.helpers.max([1, 2, 3, 4, 5]); // -> 5
```

#### kofi.helpers.min(array)

Returns the minimum value in `array`.

```javascript
kofi.helpers.min([1, 2, 3, 4, 5]); // -> 1
```

#### kofi.helpers.range(start, end\[, step\])

Returns a new array with values starting in `start` to `end` (included). You can specify the distance between each number in the sequence by providing a `step` value. Default `step` value is `1`.

```javascript
kofi.helpers.range(0, 5); // -> [0, 1, 2, 3, 4, 5]
kofi.helpers.range(0, 4, 2); // -> [0, 2, 4] 
```

#### kofi.helpers.pad(num, length[, chars])

Pad a number `num` adding zeros on the left side if it has less digits than `length`. You can also specify the characters used for padding.

```javascript
kofi.helpers.pad(1234, 5);  // -> "01234"
kofi.helpers.pad(1234, 3);  // -> "1234"
kofi.helpers.pad(1234, 6, "-");  // -> "--1234"
```

#### kofi.helpers.random(min, max)

Returns a random number between `min` and `max` (not included). If this functions is called only with one argumet, it returns a random number between `0` and that number.

```javascript
kofi.helpers.random(0, 5);  // -> 3.7561160836655425
```

#### kofi.helpers.values(obj)

Returns an array of a given object's own enumerable property values. It's a ponyfill of the [ `Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) method.

```javascript
let obj = {
    a: 1,
    b: 2,
    c: "hello"
};
let values = kofi.helpers.values(obj); // -> values = [1, 2, "hello"]
```

#### kofi.helpers.camelCase(str)

Returns the camel-case format of `str`.

```javascript
kofi.helpers.camelCase("hello world");  // -> "helloWorld"
```

#### kofi.helpers.capitalize(str)

Returns the capitalized format of `str`.

```javascript
kofi.helpers.capitalize("hello world");  // -> "Hello world"
```

#### kofi.helpers.format(str, obj)

Replace all handlebars expressions from `str` with values of `obj`.

```javascript
kofi.helpers.format('My car is {{ color }}!', { color: 'blue' }); // --> "My car is blue!"
```

#### kofi.helpers.kebabCase(str)

Returns the kebab-case form of the string `str`.

```javascript
kofi.helpers.kebabCase("hello world");  // -> "hello-world"
```

#### kofi.helpers.repeat(str, n)

Repeats a string `n` times.

```javascript
kofi.helpers.repeat("x", 5);  // -> "xxxxx"
```

#### kofi.helpers.reverse(str)

Returns the reverse of the string `str`.

```javascript
kofi.helpers.reverse("hello world"); // -> "dlrow olleh"
```

#### kofi.helpers.snakeCase(str)

Returns the snake-case form of the string `str`.

```javascript
kofi.helpers.snakeCase("hello world");  // -> "hello_world"
```

#### kofi.helpers.tempid()

Generates a unique random string of 15 characters.

```javascript
kofi.helpers.tempid();  // -> str = "wv1ufiqj5e6xd3k"
```

#### kofi.helpers.truncate(str, opt)

Truncates the provided `str` text if is longer than a provided `length`. The `opt` argument is an `object` with the following entries:
- `length`: (**mandatory**) a `number` with the maximum length of `str`.
- `separator`: a `string` used to truncate the string `str`.
- `omission`: the `string` to be used to represent clipped text. Default is `"..."`. This text is added to the returned string, so the ammount of text displayed from `str` will be decreased.

```javascript
kofi.helpers.truncate("Lorem ipsum dolor sit amet", {length: 11}) 
// -> "Lorem ip..."
kofi.helpers.truncate("Lorem ipsum dolor sit amet", {length: 11, omission: ""})
// -> "Lorem ipsum"
kofi.helpers.truncate("Lorem ipsum dolor sit amet", {length: 15, separator: " "});
// -> "Lorem ipsum..."
```


## License

**kofi** is released under the [MIT LICENSE](./LICENSE).

