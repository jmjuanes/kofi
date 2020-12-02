import {render, update} from "./element.js";
import {isObject, isFunction} from "./helpers.js";
import {object as safeObject} from "./object.js";

//Create a kofi component
export function component (value) {
   if (isObject(value) === false) {
        throw new Error("kofi.component argument must ve a valid object");
    }
    //Check for no render method provided
    if (!isFunction(value.render)) {
        throw new Error("You must implement a 'render' method");
    }
    //Return the component definition
    return value; 
}

//Render component
let renderComponent = function (instance) {
    let vdom = instance.render.call(instance, instance.props, instance.state); 
    //Check for not object or string provided after calling the render method
    if (typeof vdom !== "object" && typeof vdom !== "string") {
        throw new Error("Invalid content returned from 'render' method.");
    }
    //Return the vdom tree
    return vdom;
};

//Mount a kofi component
export function mount (parent, obj, props) {
    //Undefined renderer
    if (!isFunction(obj.render)) {
        throw new Error("You must implement a 'render' method");
    }
    //Initialize a new instance on the component
    let instance = Object.assign({}, obj);
    Object.keys(instance).forEach(function (key) {
        if (typeof instance[key] === "function") {
            instance[key] = instance[key].bind(instance);
        }
    });
    //Initialize instance state and props
    Object.assign(instance, {
        "props": safeObject.freeze((isObject(props) === true) ? props : {}), 
        "state": {}, //getDefaultValues(obj.initstate, {}),
        "refs": {},
        "__vdom": null,
        "__parent": parent
    });
    //Call the component init method
    if (isFunction(instance.oninit)) {
        instance.oninit.call(instance);
    }
    //Define component update method
    instance.update = function (newState, cb) {
        let self = this;
        if (isObject(newState) === true) {
            Object.assign(self.state, newState); //Update the instance state
        }
        let vdom = renderComponent(self); //Get a new vdom tree
        update(vdom, self.__vdom, self.__parent, self.refs);
        self.__vdom = vdom; //Update the current rendererd vdom tree
        if (isFunction(self.onupdate)) {
            self.onupdate.call(self);
        }
        //Check if a callback has been provided
        if (isFunction(cb) === true) {
            return cb.call(null);
        }
        else if (isFunction(newState) === true) {
            return newState.call(null);
        }
    };
    //Bind update method
    instance.update = instance.update.bind(instance);
    //Register destroy method
    instance.destroy = function () {
        let self = this;
        if (isFunction(self.onremove)) {
            self.onremove.call(self);
        }
        //Remove all nodes from parent
        while(self.__parent.lastElementChild) {
            self.__parent.removeChild(self.__parent.lastElementChild);
        }
    };
    //Mount the component
    instance.__vdom = renderComponent(instance);
    render(instance.__parent, instance.__vdom, instance.refs);
    if (isFunction(instance.onmount)) {
        instance.onmount.call(instance);
    }
    //Return the component instance
    return instance;
}

