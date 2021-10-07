// Export store manager
export const store = (initialState) => ({
    state: {...(initialState || {})},
    listeners: [],
    // Methods to manipulate the state
    get: () => this.state,
    update: (mutation) => {
        if (typeof mutation === "function") {
            Object.assign(this.state, mutation(this.state));
        }
        else if (typeof mutation === "object") {
            Object.assign(this.state, mutation || {});
        }
        // Run the listeners with the new state
        this.listeners.forEach(f => f(this.state));
    },
    mutate: (fn) => {
        return (...args) => this.update(fn(this.state, ...args));
    },
    // Subscribe to state changes
    subscribe: (fn) => {
        this.listeners.push(fn);
        fn(this.state); // Call the listener with the current state

        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(f => f !== fn);
        };
    },
});
