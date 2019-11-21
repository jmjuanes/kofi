//Create a dom element
export function createElement (type, props) {
    if(typeof props !== "object") { 
        props = {}; 
    }
    //Initialize the children list
    let children = [];
    //Check the number of arguments
    if (arguments.length >= 3) {
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
    if (typeof type === "string") {
        return {"type": type.toLowerCase().trim(), "props": props, "children": children};
    }
    else {
        //Render the component and return the generated element tree
        return type.call(null, props, children);
    }
}

//Mount an element
export function mountElement (el, parent, refs) {
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
            return setProperty(node, name, el.props[name], refs);
        });
        //Mount each children in the new node
        el.children.forEach(function(child) {
            return mountElement(child, node, refs);
        });
    }
    //Mount the new node
    if (typeof parent !== "undefined" && parent !== null) {
        parent.appendChild(node);
    }
    return node;
}

//Update an element
export function updateElement (newNode, oldNode, parent, refs, index) {
    if (typeof refs !== "object" || refs === null) {
        refs = {};
    }
    if (typeof index !== "number"){ 
        index = 0; 
    }
    //Check for no old node --> mount this new element
    if (!oldNode) { 
        return mountElement(newNode, parent, refs); 
    }
    //If there is not new element --> remove the old element
    else if (!newNode) { 
        return parent.removeChild(parent.childNodes[index]); 
    }
    //If nodes has changed
    else if (nodesDiffs(newNode, oldNode)) {
        return parent.replaceChild(mountElement(newNode, null, refs), parent.childNodes[index]);
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
            updateElement(newChildren, oldChildren, parent.childNodes[index], refs, i);
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
function setProperty (parent, name, value, refs) {
    //Check for null value --> Remove the property
    if (value === null || value === false) { 
        return removeProperty(parent, name, value, refs); 
    }
    //Check for reference 
    else if (name === "ref") {
        refs[value] = parent;
    }
    //Check for class property
    else if (name === "className") {
        parent.setAttribute("class", value);
    }
    //Check for style property
    else if (name === "style") {
        if (typeof value !== "object") {
            throw new Error("Styles must be an object");
        }
        //Assign all styles to the element
        Object.keys(value).forEach(function (key) {
            parent.style[key] = value[key];
        });
    }
    //Check for event listener property
    else if (isEventProperty(name) === true) {
        //Register the event listener
        parent.addEventListener(name.slice(2).toLowerCase(), value);
    }
    else if (value === true) {
        parent[name] = true;
        parent.setAttribute(name, "true");
    }
    else {
        //Default, set the attribute value
        parent.setAttribute(name, value);
    }
}

//Remove a property
function removeProperty (parent, name, value, refs) {
    if (name === "className") {
        parent.removeAttribute("class");
    }
    else if (name === "style") {
        parent.style = null;
    }
    else if (name === "ref") {
        delete refs[value];
    }
    else if (isEventProperty(name) === true) {
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

//Check if the property is an event listener
function isEventProperty (name) {
    //Return if the property name starts with "on"
    return /^on/.test(name);
}

