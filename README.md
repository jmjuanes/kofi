# Kofi

![npm version](https://badgen.net/npm/v/kofi?labelColor=1d2734&color=21bf81)
![license](https://badgen.net/github/license/jmjuanes/kofi?labelColor=1d2734&color=21bf81)
![PRs welcome](https://badgen.net/badge/PRs/welcome/kofi?labelColor=1d2734&color=21bf81)
![status](https://badgen.net/badge/status/on_development?labelColor=1d2734&color=orange)
![stability](https://badgen.net/badge/stability/experimental?labelColor=1d2734&color=orange)

**Kofi** is a JavaScript library (less than 400 lines of code) for building small **frontend applications**. 


## Installation

You can add **kofi** to your project using NPM or Yarn:

```
## Install using NPM
$ npm install --save kofi

## Install using Yarn
$ yarn add kofi
```

## Getting started

The **kofi** package can be used via modules:

```html
<script type="module">
    import kofi from "https://unpkg.com/kofi/kofi.js";
</script>
```

## API

### kofi(type, props[, ...children])

Creates a new VDOM Node element of the specified `type`, with the specified `props` and `children`.

```javascript
kofi("div", {"align": "center"}); // --> <div align="center"></div>

kofi("div", {}, "Hello world"); // --> <div>Hello world</div>
```

This method does not return a DOM element. It returns a Virtual DOM Node element, which is a JSON representation of the DOM element. 

To transform it into a real DOM element, use `kofi.render`.

#### Type

The `type` argument can be either a tag name string (such as `"div"` or `"a"`) or a function.

```javascript
//Using a tag name
kofi("a", {"href": "https://google.es"}, "Click me!"); 
//Renders to: <a href="https://google.es">Click me!</a>

//Using a function
const Welcome = (props, children) => {
    return kofi("span", {}, `Hello ${props.name}`);
};

kofi(Welcome, {"name": "Bob"}); 
//Renders to: <span>Hello Bob</span>
```

#### Props

The `props` argument is an object with the data of the element. This can include HTML attributes, events listeners or custom properties that our functional element will use.

```javascript
kofi("div", {
    "className": "button",
    "onclick": event => { /* Handle click event */ },
    "id": "button1",
});
```

##### Class names

Use the `className` property to set the CSS class.

```javascript
kofi("div", {"className": "button"}, "Button");
```

##### Events

Attach a callback listener to an event.

```javascript
kofi("div", {
    "onclick": event => { /* Handle click event */ },
    "onmousedown": event => { /* Handle mouse down event */ },
    "onmouseup": event => { /* Handle mouse up event */ },
});
```

##### References

Use the `ref` property to save a reference of the element.

```javascript
// 1. use kofi.ref to generate a reference variable
const inputRef = kofi.ref();

// 2. assign inputRef to an element
kofi("input", {ref: inputRef});

// 3. now you can access to the referenced element
console.log(inputRef.current.value);
```

##### Styles

You can provide an object with the style of the element. All styles attributes should be in camel-case format.

```javascript
kofi("div", {
    style: {
        backgroundColor: "blue",
        color: "white",
    },
    align: "center"
}, "Hello");
```

#### Use it with JSX

You can use the babel's plugin [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) for creating DOM elements using JSX. 

This example using JSX: 

```jsx
/** @jsx k */
import k from "kofi";

const user = (
    <div>
        <img className="avatar" src="/path/to/user.png" />
        <span>Hello user</span>
    </div>
);
```

Compiles to:

```javascript
/** @jsx k */
const k = require("kofi");

const user = k("div", null, 
    k("img", {"className": "avatar", "src": "/path/to/user.png"}),
    k("span", null, "Hello user"),
);
```

### kofi.html

A JavaScript [template tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) that converts a JSX-like syntax into a VDOM tree, that you can use with `kofi.render`.

Example:

```javascript
import k from "kofi";

const user = k.html`
    <div align="center">
        <img className="avatar" src="/path/to/user.png" />
        <span>Hello user</span>
    </div>
`;
```

Features:
- Dynamic props: `<div align="${currentAlign}" />`.
- Dynamic content: `<div>Hello ${name}</div>`.
- Events: `<div onClick="${() => console.log("clicked")}"></div>`.
- Spread props: `<div ...${extraProps}>`.

### kofi.ref()

Returns a new object with a single key `current` initialized to `null`. Use this object to save a reference to rendered elements with `kofi.render`.


### kofi.render(parent, element)

Renders a VDOM Node to the DOM.

```javascript
const el = kofi("div", {}, "Hello world!");

kofi.render(el, document.getElementById("root"));
```

The first arguments is the VDOM Node to render, and the second argument is the parent DOM element. Returns a reference to the rendered DOM element.

### kofi.state(initialState)

A simplified state management utility for handling object-based state. It provides an easy-to-use API for updating state and managing listeners for state changes. This method returns an object containing the initial state and three special methods: `$update`, `$on`, and `$off`.

This method accepts the following parameters:

- `initialState` (`Object`): The initial state of the object. This is the default state that will be managed.

Adn returns a `state` object containing:

- `state.$update(partialState)`: Updates the current state by merging the `partialState` with the existing state. It only works with object types. After the state is updated, any registered listeners will be notified.
- `state.$on(listener)`: Registers a listener function that will be called whenever the state is updated.
- `state.$off(listener)`: Unregisters a previously registered listener, preventing it from being called on future state updates.

Example usage:

```javascript
// Initialize state with an object
const state = kofi.state({ count: 0 });

// Update state
state.$update({ count: state.count + 1 });

// Register a listener for state changes
const listener = () => {
    console.log("Count updated:", state.count);
};
state.$on(listener);

// Remove the listener when no longer needed
state.$off(listener);
```

Notes:
- State changes are shallow, meaning only top-level properties are merged. Nested objects will not be deeply merged.
- You can register multiple listeners, and they will all be notified upon a state change.
- Updating the state is an async operation. The `state.$update` method returns a promise that will resolve when the state have been updated.


### kofi.ready(fn)

Executes the provided function `fn` when the DOM becomes ready. This utility is similar to [jQuery's ready method](https://api.jquery.com/ready/).

```javascript 
// Execute this function when the DOM is ready
kofi.ready(() => {
    console.log("DOM is ready");
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

## License

**kofi** is released under the [MIT LICENSE](./LICENSE).
