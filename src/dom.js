import {setProperty} from "./element.js";
import {isObject} from "./helpers.js";

//Dom management
export const dom = {
    //Create an element node
    "create": function (name, props) {
        let el = document.createElement(name);
        if (isObject(props)) {
            Object.keys(props).forEach(function (key) {
                return setProperty(el, key, props[key], null);
            });
        }
        //Insert children
        let args = arguments;
        for (let i = 2; i < args.length; i++) {
            //Check for string --> insert as text node
            if (typeof args[i] === "string") {
                el.appendChild(document.createTextNode(args[i]));
            }
            //Check for not null element --> insert
            else if (args[i] !== null) {
                el.appendChild(arguments[i]);
            }
        }
        //Return the new element
        return el;
    },
    //Mount an element
    "mount": function (node, parent) {
        parent.appendChild(node);
    },
    //Remove all children of a dom node
    "empty": function (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },
    //Remove an element
    "delete": function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
};

