const getLocalStorage = function () {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage;
    }
    else if (typeof localStorage !== "undefined") {
        return localStorage;
    }
    //Storage not available
    return null;
};

//Local/Cache storage driver
let StorageClient = function (options) {
    this.db = options.mode === "session" ? sessionStorage : getLocalStorage();
    this.name = options.name || "default"; //Storage name
    this.prefix = `__kofi_${this.name}__`; //Storage prefix
};

//Storage driver methods
StorageClient.prototype = {
    //Initialize the storage driver
    "open": function () {
        return Promise.resolve();
    },
    //Close the storage driver
    "close": function () {
        return Promise.resolve();
    },
    //Get a single item
    "get": function (key) {
        let self = this; //Save reference to this
        return new Promise(function (resolve, reject) {
            let data = self.db.getItem(self.prefix + key);
            if (data === null) {
                return reject(new Error("Not found"));
            }
            //Return the parsed value
            return resolve(JSON.parse(data).value);
        });
    },
    //Add or update a single item
    "set": function (key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.db.setItem(self.prefix + key, JSON.stringify({"value": value}));
            return resolve();
        });
    },
    //Remove an item
    "remove": function (key) {
        return Promise.resolve(this.db.removeItem(this.getKey(key)));
    },
    //Iterate over all items
    "forEach": function (callback) {
        let self = this;
        return new Promise(function (resolve, reject) {
            for (let i = 0; i < self.db.length; i++) {
                let key = self.db.key(i); //Get current key
                if (key.indexOf(self.prefix) === 0) {
                    callback(key.replace(self.prefix, ""), JSON.parse(self.db.getItem(key)).value);
                }
            }
            //Resolve promise
            return resolve();
        });
    },
    //Remove all items
    "clear": function () {
        let self = this;
        return new Promise(function (resolve, reject) {
            for (let i = self.db.length - 1; i >= 0; i--) {
                let key = self.db.key(i); //Get current key
                if (key.indexOf(self.prefix) === 0) {
                    self.db.removeItem(key);
                }
            }
            //Resolve
            return resolve();
        });
    },
    //Create a new storage instance
    "create": function (options) {
        return new StorageClient(options || {});
    }
};

//Return a basic storage client
export const storage = new StorageClient({"name": "default"});

