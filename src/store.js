// Export store manager
export const store = (initialState) => {
    let state = {...initialState}; 
    let listeners = [];

    // Get the current state
    const get = () => state;

    // Update the state
    const update = (mutation) => {
        if (typeof mutation === "function") {
            state = {...state, ...mutation(state)};
        }
        else if (typeof mutation === "object") {
            state = {...state, ...mutation};
        }
        // Run the listeners with the new state
        listeners.forEach(f => f(state));
    };

    //Subscribe to state changes
    const subscribe = (listener) => {
        listeners.push(listener);
        listener(state); // Call the listener with the current state

        // Return an unsubscribe function
        return () => {
            listeners = listeners.filter(f => f !== listener);
        };
    };

    // Generate a mutator
    const mutate = (fn) => {
        return (...args) => update(fn(state, ...args));
    };

    //Return store methods
    return {get, update, subscribe, mutate};
};
