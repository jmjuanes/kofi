import {isFunction, isString} from "./helpers.js";

//Non closing tags
const nonClosingTags = ["link", "meta", "input", "br", "img", "hr"];

//Create a dom element
export function element (type, props) {
    if (typeof props !== "object" || props === null) { 
        props = {}; 
    }
    let children = []; //Initialize the chinldren list
    //Check for only one argument and is an array
    if (arguments.length === 3 && Array.isArray(arguments[2])) {
        children = arguments[2]; //Save as array
    }
    else if (arguments.length >= 3) {
        //Insert all children elements
        for (let i = 2; i < arguments.length; i++) {
            if (typeof arguments[i] !== "undefined" && arguments[i] !== null) {
                //Check for array of childrens
                if (Array.isArray(arguments[i]) === true) {
                    throw new Error("Array of childrens are not allowed");
                }
                children.push(arguments[i]);
            }
        }
    }
    //Parse the element type
    if (isString(type)) {
        return {
            "type": type.toLowerCase().trim(), 
            "props": props, 
            "children": children
        };
    }
    else {
        //Render the component and return the generated element tree
        return type.call(null, props, children);
    }
}

//Mount an element
export function render (parent, el, refs) {
    if (typeof refs !== "object" || refs === null) {
        refs = {};
    }
    //Initialize the node
    let node = null;
    //Check for text node
    if (typeof el === "string") {
        node = document.createTextNode(el);
    }
    else {
        //Create the new DOM element and assign the element properties
        node = document.createElement(el.type);
        Object.keys(el.props).forEach(function(name) {
            if (name !== "html") {
                return setProperty(node, name, el.props[name], refs);
            }
        });
        //Check if html property has been provided
        if (typeof el.props.html === "string") {
            node.innerHTML = el.props.html; //Inject html
        }
        //If no html proerty has been provided
        else {
            //Mount each children in the new node
            el.children.forEach(function(child) {
                return render(node, child, refs);
            });
        }
    }
    //Mount the new node
    if (typeof parent !== "undefined" && parent !== null) {
        parent.appendChild(node);
    }
    return node;
}

//Convert a VDOM element to string
export function stringify (el, delimiter) {
    if (typeof el === "string") {
        return el; //String node --> nothing to do
    }
    const props = el.props || {};
    //Build attributes of this element
    const attrs = Object.keys(props).map(function (name) {
        const value = props[name]; //Get attribute value
        //Check for ref or event attribute --> ignore
        if (name === "ref" || typeof value === "function" || value === null || value === "html") {
            return "";
        }
        //Check for boolean value
        else if (value === true) {
            return name; //Return only the property name
        }
        //Check for className attribute
        else if (name === "className" && typeof value === "string") {
            return `class="${value}"`;
        }
        //Check for style and object value
        else if (name === "style" && typeof value === "object") {
            //Convert all style values to string to snake-case format
            const styleValues = Object.keys(value).map(function (key) {
                return `${key.split(/(?=[A-Z])/).join("-").toLowerCase()}:${value[key]}`;
            });
            return `style="${styleValues.join(";")}"`;
        }
        //Check for string value --> set the value
        else if (typeof value === "string") {
            return `${name}="${value}"`;
        }
        //Other value --> nothing to do
        return "";
    }).filter(function (value) {
        return value.length > 0;
    });
    //Check if this tag is in the non closing tags list
    if (nonClosingTags.indexOf(el.type) > -1) {
        return `<${el.type} ${attrs.join(" ")}/>`;
    }
    //Build the content of the element
    const content = isString(props.html) ? [props.html] : el.children.map(function (child) {
        return stringify(child, delimiter);
    });
    //Return the element with the content
    return `<${el.type} ${attrs.join(" ")}>${content.join(delimiter || "")}</${el.type}>`;
};


//Update an element
export function update (newNode, oldNode, parent, refs, index) {
    if (typeof refs !== "object" || refs === null) {
        refs = {};
    }
    if (typeof index !== "number"){ 
        index = 0; 
    }
    //Check for no old node --> mount this new element
    if (!oldNode) { 
        return render(parent, newNode, refs); 
    }
    //If there is not new element --> remove the old element
    else if (!newNode) { 
        return parent.removeChild(parent.childNodes[index]); 
    }
    //If nodes has changed
    else if (nodesDiffs(newNode, oldNode)) {
        return parent.replaceChild(render(null, newNode, refs), parent.childNodes[index]);
    }
    //Change the properties only if element is not an string
    else if (typeof newNode !== "string") {
        //Get the full properties values and update the element attributes
        let props = Object.assign({}, newNode.props, oldNode.props);
        Object.keys(props).forEach(function(name) {
            let newValue = newNode.props[name];
            let oldValue = oldNode.props[name];
            //Check if this property does not exists in the new element
            if (!newValue) {
                removeProperty(parent.childNodes[index], name, oldValue, refs);
            }
            //Check if this property exists in the old element or values are not the same
            else if (!oldValue || newValue !== oldValue) {
                setProperty(parent.childNodes[index], name, newValue, refs);
            }
        });
        //Update the children for all element
        let maxLength = Math.max(newNode.children.length, oldNode.children.length);
        for (let i = 0; i < maxLength; i++) {
            //Get the nodes to update
            let newChildren = (i < newNode.children.length) ? newNode.children[i] : null;
            let oldChildren = (i < oldNode.children.length) ? oldNode.children[i] : null;
            update(newChildren, oldChildren, parent.childNodes[index], refs, i);
        }
    }
}

//Check if there are differences between two nodes
function nodesDiffs (node1, node2) {
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
}

//Set a property
export function setProperty (parent, name, value, refs) {
    //Check for null value --> Remove the property
    if (value === null || value === false) { 
        return removeProperty(parent, name, value, refs); 
    }
    //Check for reference 
    else if (name === "ref" && refs !== null) {
        refs[value] = parent;
    }
    //Check for class|checked|value  property
    else if (name === "className" || name === "checked" || name === "value") {
        parent[name] = value;
    }
    //Check for style property
    else if (name === "style") {
        //Check for string --> set as css text
        if (typeof value === "string") {
            parent.style.cssText = value;
        }
        //Check for object --> set each style as property
        else if (typeof value === "object") {
            Object.keys(value).forEach(function (key) {
                parent.style[key] = value[key];
            });
        }
        //Other value --> throw error
        else {
            throw new Error("Styles must be an object");
        }
    }
    //Check for event listener property
    else if (typeof value === "function" && name.startsWith("on")) {
        parent.addEventListener(name.slice(2).toLowerCase(), value);
    }
    //Check for boolean attribute
    else if (value === true) {
        parent[name] = true;
        parent.setAttribute(name, "true");
    }
    //Default: set the attribute name
    else {
        parent.setAttribute(name, value);
    }
}

//Remove a property
export function removeProperty (parent, name, value, refs) {
    if (name === "className") {
        parent.removeAttribute("class");
    }
    else if (name === "style") {
        parent.style = null;
    }
    else if (name === "ref") {
        delete refs[value];
    }
    else if (typeof value === "function" && name.startsWith("on")) {
        //Remove the event listener
        parent.removeEventListener(name.slice(2).toLowerCase(), value);
    }
    else if (value === false) {
        //Remove the boolean property
        parent[name] = false;
        parent.removeAttribute(name);
    }
    else {
        //Default, remove the attribute value
        parent.removeAttribute(name);
    }
}

