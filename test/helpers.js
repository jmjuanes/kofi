let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("each", function () {
    it("calls a function with each value in the array", function (done) {
        let list = [0, 1, 2, 3];
        let eachPromise = kofi.each(list, function (value, index, next) {
            assert.equal(value, list[index]);
            return next();
        });
        eachPromise.then(function () {
            return done();
        });
    });
    it("stops the loop when a false value is returned", function (done) {
        let list = [0, 1, 2, 3];
        let executed = 0;
        let eachPromise = kofi.each(list, function (value, index, next) {
            executed = executed + 1;
            if (index === 2) {
                return next(false);
            }
            return next();
        });
        eachPromise.then(function () {
            assert.equal(executed, 0);
        });
        eachPromise.catch(function () {
            assert.equal(executed, 3);
            return done();
        });
    });
});

describe("each", function () {
    let obj = {
        name: "Bob",
        age: 30,
        city: "Tokio"
    };
    it("executes a function for ach pair key-value", function (done) {
        let keys = ["name", "age", "city"];
        let values = ["Bob", 30, "Tokio"];
        let j = 0;
        let eachPromise = kofi.each(obj, function (key, value, next) {
            assert.equal(keys[j], key);
            assert.equal(values[j], value);
            j = j + 1;
            return next();
        });
        eachPromise.then(function () {
            assert.equal(j, 3);
            return done();
        });
    });
    it("stops when a false boolean is returned", function (done) {
        let j = 0;
        let eachPromise = kofi.each(obj, function (key, value, next) {
            j = j + 1;
            if (j === 2) {
                return next(false);
            }
            return next();
        });
        eachPromise.then(function () {
            assert.equal(j, 0);
        });
        eachPromise.catch(function () {
            assert.equal(j, 2);
            return done();
        });
    });
});

describe("values", function () {
    it("returns all values of an object", function (done) {
        let obj = {
            name: "Bob",
            age: 30,
            city: "Tokio"
        };
        let values = kofi.values(obj);
        assert.equal(values.length, 3);
        assert.equal(values[1], 30);
        return done();
    });
});

describe("format", function () {
    it("replaces all handlebars values", function (done) {
        let str = kofi.format("my car is {{ color }}", {color: "blue"});
        assert.equal(str.indexOf("color"), -1);
        assert.notEqual(str.indexOf("blue"), -1);
        return done();
    });
});

describe("timestamp", function () {
    it("returns a formatted timestamp", function (done) {
        let d = new Date();
        assert.equal(kofi.timestamp("YYYY", d), d.getFullYear().toString());
        return done();
    });
});

describe("tempd", function () {
    it("generates unique ids", function (done) {
        let ids = [];
        let j = 0;
        while (j < 100) {
            let id = kofi.tempid();
            assert.equal(ids.indexOf(id), -1);
            ids.push(id);
            j++
        }
        return done();
    });
});

