import {mountElement, updateElement} from "./element.js";

//Create a new component
export function createComponent(obj) {
    if (typeof obj !== "object" || obj === null) {
        throw new Error("createComponent argument must ve a valid object");
    }
    //Component default configuration
    let component = {
        //"state": null,
        //"props": null,
        //"refs": null,
        "getDefaultState": function () {
            return {};
        },
        "getDefaultProps": function () {
            return {};
        }
    };
    //Assign the functions defined in the provided object
    Object.keys(obj).forEach(function (key) {
        //Check for invalid component key
        if (key === "state" || key === "props") {
            throw new Error("Invalid function name '" + key + "'. This name is already reserved");
        }
        if (typeof obj[key] === "function") {
            component[key] = obj[key];
        }
        //console.warn("Invalid type '" + key + "'. Only functions are allowed");
    });
    //Undefined component render
    if (typeof component.render !== "function") {
        throw new Error("You must implement the component's 'render' method");
    }
    //Return the new component
    return component;
}

//Mount a component
export function mountComponent(originalComponent, props, parent) {
    //Clone the component
    let component = Object.assign({}, originalComponent);
    Object.keys(component).forEach(function (key) {
        if (typeof component[key] === "function") {
            component[key] = component[key].bind(component);
        }
    });
    let currentContent = null;
    //Get the initial state, refs and props
    component.props = Object.assign(component.getDefaultProps(), props);
    component.state = component.getDefaultState();
    component.refs = {};
    //Render the component content
    let renderComponent = function () {
        let content = component.render.call(component, component.props, component.state);
        if (typeof content !== "object") {
            throw new Error("Invalid content returned from 'render' method.");
        }
        return content;
    };
    //Call the component created
    if (typeof component.onCreated === "function") {
        component.onCreated.call(component);
    }
    //Define component set state method
    component.setState = function (newState, cb) {
        if (typeof newState !== "object" || newState === null) {
            throw new Error("New state must be an object");
        }
        component.state = Object.assign(component.state, newState);
        let content = renderComponent();
        updateElement(content, currentContent, parent, component.refs);
        currentContent = content;
        if (typeof component.onUpdated === "function") {
            component.onUpdated.call(component);
        }
        if (typeof cb === "function") {
            return cb.call(component);
        }
    };
    component.setState = component.setState.bind(this);
    //Mount the component
    currentContent = renderComponent();
    mountElement(currentContent, parent, component.refs);
    if (typeof component.onMounted === "function") {
        component.onMounted.call(component);
    }
    return component;
}

