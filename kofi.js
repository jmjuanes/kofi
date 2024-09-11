// Self closing tags
const selfClosingTags = new Set(["link", "meta", "input", "br", "img", "hr"]);

// Modes for parsing template literal to VDOM
const HTML_TEMPLATE_MODE = {
    TEXT: 1,
    TAG_START: 2,
    TAG_END: 3,
    PROP_NAME: 4,
    PROP_VALUE: 5,
};

// Set a property
const setProperty = (el, name, value = null) => {
    // Check for style property and string value --> set as css string
    if (name === "style") {
        if (value && typeof value === "object") {
            el.style.cssText = null; // Clear styles
            Object.keys(value).forEach(k => el.style[k] = value[k]);
        }
        else {
            el.style.cssText = value;
        }
    }
    // Check for event listener property
    else if (name.startsWith("on")) {
        el[key.toLowerCase()] = value;
    }
    // Default: set the property value
    else if (name !== "html") {
        el[name] = value;
    }
};

// Check if there are differences between two nodes
const nodesDiffs = (node1, node2) => {
    // Check if nodes have the same type
    if (typeof node1 !== typeof node2) { 
        return true; 
    }
    // Check if nodes are strings
    else if (typeof node1 === "string" && node1 !== node2) { 
        return true; 
    }
    // Check if nodes has not the same tag
    else if (node1.type !== node2.type) { 
        return true; 
    }
    // Default, nodes are the same
    return false;
};

// @public main vdom element creator
const kofi = (type, props, ...children) => {
    if (type && typeof type === "string") {
        return {
            type: type.toLowerCase().trim(), 
            props: props || {}, 
            children: (children || []).flat().filter(c => !!c),
        };
    }
    // Check for function type
    else if (typeof type === "function") {
        return type(props, children);
    }
    // Other type --> throw error
    throw new Error("Invalid element type provided");
};

// @private convert a template literal to a VDOM
kofi.template = (h, literal, values, ctx = {i: 0, j: 0}, closing = null) => {
    const children = [];
    let mode = HTML_TEMPLATE_MODE.TEXT, buffer = "", current = null, quote = null;
    while (ctx.i < literal.length) {
        while (ctx.j < literal[ctx.i].length) {
            const char = literal[ctx.i][ctx.j];
            const nextChar = literal[ctx.i][ctx.j + 1];
            // We found a '<' character
            if (mode === HTML_TEMPLATE_MODE.TEXT && char === "<") {
                if (buffer.trim() !== "") {
                    children.push(buffer);
                }
                buffer = "";
                mode = HTML_TEMPLATE_MODE.TAG_START;
            }
            // We are in TAG_START mode and we found a '/' character with empty buffer
            else if (mode === HTML_TEMPLATE_MODE.TAG_START && char === "/" && !buffer) {
                mode = HTML_TEMPLATE_MODE.TAG_END;
            }
            // We are in TAG_START mode and we found a '/' character with non empty buffer
            else if (mode === HTML_TEMPLATE_MODE.TAG_START && char === "/" && buffer && nextChar === ">") {
                children.push(h(buffer, {}));
                buffer = "";
                mode = HTML_TEMPLATE_MODE.TEXT;
                ctx.j = ctx.j + 1; // Skip next '>'
            }
            // We are in TAG_START mode and we found a '>' character
            else if (mode === HTML_TEMPLATE_MODE.TAG_START && char === ">") {
                ctx.j = ctx.j + 1;
                children.push(h(buffer, {}, ...(kofi.template(h, literal, values, ctx, buffer) || [])));
                buffer = "";
                mode = HTML_TEMPLATE_MODE.TEXT;
            }
            // We are in TAG_START mode and we found a whitespace character
            else if (mode === HTML_TEMPLATE_MODE.TAG_START && char === " ") {
                current = [buffer, {}, [], ""];
                buffer = "";
                mode = HTML_TEMPLATE_MODE.PROP_NAME;
            }
            // We are in PROP_NAME mode and we found a '/' character
            else if (mode === HTML_TEMPLATE_MODE.PROP_NAME && char === "/" && nextChar === ">") {
                if (buffer.trim() !== "") {
                    current[1][buffer.trim()] = true;
                }
                children.push(h(current[0], current[1], ...current[2]));
                current = null;
                mode = HTML_TEMPLATE_MODE.TEXT;
                buffer = "";
                ctx.j = ctx.j + 1; // Skip next '>'
            }
            // We found a '>' character and we are in property name mode
            else if (mode === HTML_TEMPLATE_MODE.PROP_NAME && char === ">") {
                if (buffer.trim() !== "") {
                    current[1][buffer.trim()] = true;
                }
                ctx.j = ctx.j + 1;
                current[2] = kofi.template(h, literal, values, ctx, current[0]);
                children.push(h(current[0], current[1], ...current[2]));
                current = null;
                mode = HTML_TEMPLATE_MODE.TEXT;
                buffer = "";
            }
            // We found a '>' character and we are in closing tagname
            else if (mode === HTML_TEMPLATE_MODE.TAG_END && char === ">") {
                if (buffer !== closing) {
                    throw new Error(`Unexpected closing tag. Expected '${closing}' but got '${buffer}'`);
                }
                return children;
            }
            // We found a '=' character and we are in PROP_NAME mode
            else if (mode === HTML_TEMPLATE_MODE.PROP_NAME && char === "=") {
                current[3] = buffer.trim();
                buffer = "";
                mode = HTML_TEMPLATE_MODE.PROP_VALUE;
                if (nextChar === `"` || nextChar === `'`) {
                    ctx.j = ctx.j + 1;
                    quote = nextChar;
                }
            }
            // We found a whitespace character and we are in PROP_NAME mode
            else if (mode === HTML_TEMPLATE_MODE.PROP_NAME && char === " ") {
                if (buffer.trim() !== "") {
                    current[1][buffer.trim()] = true;
                }
                buffer = "";
            }
            // End of property value
            else if (mode === HTML_TEMPLATE_MODE.PROP_VALUE && char === quote) {
                current[1][current[3]] = buffer;
                quote = null;
                buffer = "";
                mode = HTML_TEMPLATE_MODE.PROP_NAME;
            }
            // Other case, save character in buffer
            else {
                buffer = buffer + char;
            }
            ctx.j++;
        }
        ctx.j = 0;
        if (ctx.i < values.length) {
            // Check if we are in PROP_VALUE mode
            if (mode === HTML_TEMPLATE_MODE.PROP_VALUE) {
                current[1][current[3]] = values[ctx.i];
                mode = HTML_TEMPLATE_MODE.PROP_NAME;
                if (literal[ctx.i + 1][ctx.j] === quote) {
                    ctx.j = ctx.j + 1;
                }
            }
            // Check if we are in PROP_NAME and current prop is '...'
            else if (mode === HTML_TEMPLATE_MODE.PROP_NAME && buffer === "...") {
                Object.assign(current[1], values[ctx.i]);
                buffer = "";
            }
            // Check if we are in TAG_START or TAG_END modes
            else if (mode === HTML_TEMPLATE_MODE.TAG_START || mode === HTML_TEMPLATE_MODE.TAG_END) {
                buffer = values[ctx.i];
            }
            // Check if we are in text mode
            else if (mode === HTML_TEMPLATE_MODE.TEXT) {
                if (buffer.trim() !== "") {
                    children.push(buffer);
                }
                children.push(values[ctx.i]);
                buffer = "";
            }
        }
        ctx.i++;
    }
    // If we are at the end of the literal and we have buffer not added
    if (buffer.trim() !== "") {
        children.push(buffer);
    }
    return children;
};

// @public convert a tagged template to a kofi's vdom
kofi.html = (literal, ...values) => {
    return kofi.template(kofi, literal, values, {i: 0, j: 0}, null)[0];
};

// Render an element
kofi.render = (el, parent = null, options = null) => {
    const shouldUpdateParent = !!parent && !options?.skipUpdatingParent;
    let node = null;
    // check if we have to update the previously rendered content
    if (shouldUpdateParent && parent?.["_$kofi_vdom"]) {
        kofi.update(parent, el, parent["_$kofi_vdom"]);
        parent._$kofi_vdom = el;
    }
    else {
        // Check for text node
        if (typeof el === "string") {
            node = document.createTextNode(el);
        }
        else {
            // Create the new DOM element and assign the element properties
            node = document.createElement(el.type);
            Object.keys(el.props || {}).forEach(name => {
                name !== "html" && setProperty(node, name, el.props[name]);
            });
            // Check if html property has been provided
            if (typeof el.props?.html === "string") {
                node.innerHTML = el.props.html; //Inject html
            }
            // If no html property has been provided
            else {
                (el.children || []).forEach(child => kofi.render(child, node));
            }
        }
        // Mount the new node
        if (parent) {
            parent.appendChild(node);
            // save current vdom as a reference in the parent
            if (shouldUpdateParent) {
                parent["_$kofi_vdom"] = el;
            }
        }
    }
    return node;
};

// Convert a VDOM element to string
kofi.stringify = (el, delimiter = "") => {
    if (typeof el === "string") {
        return el;
    }
    // Build attributes of this element
    const attrs = Object.keys(el.props || {})
        .map(name => {
            const value = el.props[name]; //Get attribute value
            // Check for boolean value
            if (value === true) {
                return name; //Return only the property name
            }
            // Check for className attribute
            else if (name === "className" && typeof value === "string") {
                return `class="${value}"`;
            }
            // Check for style and object value
            else if (name === "style" && typeof value === "object") {
                // Convert all style values to string to snake-case format
                const styleValues = Object.keys(value).map(key => {
                    return `${key.split(/(?=[A-Z])/).join("-").toLowerCase()}:${value[key]}`;
                });
                return `style="${styleValues.join(";")}"`;
            }
            // Check for string value --> set the value
            else if (typeof value === "string" && name !== "html") {
                return `${name}="${value}"`;
            }
            return "";
        })
        .filter(v => !!v);
    // Check if this tag is in the non closing tags list
    if (selfClosingTags.has(el.type)) {
        return `<${el.type} ${attrs.join(" ")} />`;
    }
    // Build the content of the element
    const content = el.props?.html ? [el.props.html] : (el.children || []).map(child => {
        return stringify(child, delimiter);
    });
    // Return the element with the content
    return `<${el.type} ${attrs.join(" ")}>${content.join(delimiter || "")}</${el.type}>`;
};

// Update an element
kofi.update = (parent, newNode, oldNode, index) => {
    index = index && typeof index === "number" ? index : 0;
    const child = parent.childNodes[index];
    // Check for no old node --> mount this new element
    if (!oldNode) { 
        return kofi.render(newNode, parent, {skipUpdatingParent: true}); 
    }
    // If there is not new element --> remove the old element
    else if (!newNode) { 
        return parent.removeChild(child); 
    }
    // If nodes has changed
    else if (nodesDiffs(newNode, oldNode)) {
        return parent.replaceChild(kofi.render(newNode), child);
    }
    // Change the properties only if element is not an string
    else if (newNode && typeof newNode !== "string") {
        // Get the full properties values and update the element attributes
        const props = Object.assign({}, newNode.props, oldNode.props);
        Object.keys(props).forEach(name => {
            const newValue = newNode.props[name];
            const oldValue = oldNode.props[name];
            if (name !== "html" && newValue !== oldValue) {
                setProperty(child, name, newValue);
            }
        });
        // Update the children for all element
        const maxLength = Math.max(newNode.children.length, oldNode.children.length);
        for (let i = 0; i < maxLength; i++) {
            kofi.update(child, newNode.children[i], oldNode.children[i], i);
        }
    }
};

// Execute the specified function when the DOM is ready
kofi.ready = fn => {
    // Resolve now if DOM has already loaded
    if (document.readyState !== "loading") {
        return fn();
    }
    // If not, wait for DOMContentLoaded event
    document.addEventListener("DOMContentLoaded", () => {
        return fn();
    });
};

// Join class names
kofi.classNames = (...args) => {
    const names = (args || []).map(item => {
        if (typeof item === "string") {
            return item.split(" ").filter(value => !!value);
        }
        else if (Array.isArray(item)) {
            return item.filter(value => typeof value === "string" && !!value); 
        }
        else if (typeof item === "object") {
            return Object.keys(item || {}).filter(key => !!item[key]);
        }
        // Over value --> return an empty array
        return [];
    });
    return names.flat().join(" ");
};

export default kofi;
