//Dispatch handler
export class Dispatch {
    constructor() {
        this._listeners = {};
    }
    //Register a new event listener
    addListener(name, listener) {
        if (typeof this._listeners[name] === "undefined") {
            this._listeners[name] = [];
        }
        //Register the listener
        this._listeners[name].push(listener);
    }
    //Remove a listener
    removeListener(name, listener) {
        if (typeof this._listeners[name] !== "undefined") {
            //Find the listener 
            let list = this._listeners[name].filter(function (value) {
                return value !== listener;
            });
            this._listeners[name] = list;
        }
    };
    //Remove all listeners of an event 
    removeAllListeners(name) {
        if (typeof this._listeners[name] !== "undefined") {
            this._listeners[name] = [];
        }
    };
    //Emit an event
    emit(name) {
        //Check if there are listeners registered for this event
        if (typeof this._listeners[name] !== "undefined") {
            //Generate the arguments to be passed to the listeners
            let args = [];
            for (let i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            //Call each listener
            let listeners = this._listeners[name];
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].apply(null, args);
            }
        }
        return;
    }
}

//Build a new dispatcher
export function dispatcher () {
    return new Dispatch();
}

