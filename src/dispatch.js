//Build a new dispatcher
export const dispatch = () => {
    const listeners = {}; //Event listeners

    // Method to register a new event listener
    const on = (name, listener) => {
        if (typeof listeners[name] === "undefined") {
            listeners[name] = [];
        }
        listeners[name].push(listener);
    };

    //Method to remove an event listener
    const off = (name, listener) => {
        listeners[name] = (listeners[name] || []).filter(f => f !== listener);
    };

    // Dispatch event
    const dispatch = (name, ...args) => {
        (listeners[name] || []).forEach(f => f(...args));
    };

    //Return dispatch methods
    return {on, off, dispatch};
};
