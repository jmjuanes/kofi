let assert = require("assert");
let kofi = require("../../dist/kofi.cjs.js");

//Testing object
let obj = {
    name: "Bob",
    age: 30,
    city: "Tokio"
};

describe("deepClone", function () {
    it("clones an object", function (done) {
        let cloned = kofi.deepClone(obj);
        cloned.age = 25;
        assert.equal(cloned.name, obj.name);
        assert.notEqual(cloned.age, obj.age);
        return done();
    });

    it("clones recursiverly an object", function (done) {
        let obj1 = {
            "key1": "value1",
            "key2": {
                "key21": true,
                "key22": null
            },
            "key3": {
                "key31": "hello",
                "key32": [1,2,3]
            }
        };
        let obj2 = kofi.deepClone(obj1);
        assert.notEqual(obj1, obj2);
        assert.equal(obj1.key3.key32.length, obj2.key3.key32.length);
        return done();
    });
});

describe("each", function () {
    it("executes a function for ach pair key-value", function (done) {
        let keys = ["name", "age", "city"];
        let values = ["Bob", 30, "Tokio"];
        let j = 0;
        kofi.each(obj, function (key, value) {
            assert.equal(keys[j], key);
            assert.equal(values[j], value);
            j = j + 1;;
        });
        assert.equal(j, 3);
        return done();
    });

    it("stops when a false boolean is returned", function (done) {
        let j = 0;
        kofi.each(obj, function () {
            j = j + 1;
            if (j === 2) {
                return false;
            }
        });
        assert.equal(j, 2);
        return done();
    });
});

describe("equal", function () {
    it("returns true if two objects are equal", function (done) {
        let obj1 = {"key":"value"};
        let obj2 = {"key":"value"};
        let arr1 = [1, 2, 3, 4, 5];
        let arr2 = [1, 2, 3, 4, 5];
        assert.equal(kofi.equal(obj1, obj2), true);
        assert.equal(kofi.equal(arr1, arr2), true);
        assert.equal(kofi.equal(true, true), true);
        assert.equal(kofi.equal(null, null), true);
        assert.equal(kofi.equal("hello", "hello"), true);
        return done();
    });

    it("returns false if two values are not equal", function (done) {
        let obj1 = {"key": "value"};
        let obj2 = {"key": []};
        let arr1 = [1, 2, 3, 4, 5];
        let arr2 = [5, 4, 3, 2, 1];
        assert.equal(kofi.equal(obj1, obj2), false);
        assert.equal(kofi.equal(arr1, arr2), false);
        assert.equal(kofi.equal(null, obj2), false);
        assert.equal(kofi.equal(true, false), false);
        assert.equal(kofi.equal(0, 1.2), false);
        assert.equal(kofi.equal("hello", "world"), false);
        return done();
    });

    it("Performs a deep comparison of an object or array", function (done) {
        let obj1 = {"key": {"a": true, "b": false}, "arr": [1, 2, 3]};
        let obj2 = {"key": {"a": true, "b": false}, "arr": [1, 2, 3]};
        let obj3 = {"key": {"a": true, "b": null}, "arr": [1, 2, null]};
        let obj4 = {"key": {"a": true, "b": false}};
        let arr1 = [1, 2, {"a": true}, {"b": [1, 2, 3]}, null, 0, true];
        let arr2 = [1, 2, {"a": true}, {"b": [1, 2, 3]}, null, 0, true];
        let arr3 = [1, 2, {"a": true}, {"b": [1, 2, {"c": false}]}, null, 0, true];
        assert.equal(kofi.equal(obj1, obj2), true);
        assert.equal(kofi.equal(obj1, obj3), false);
        assert.equal(kofi.equal(obj1, obj4), false);
        assert.equal(kofi.equal(arr1, arr2), true);
        assert.equal(kofi.equal(arr1, arr3), false);
        return done();
    });
});

describe("values", function () {
    it("returns all values of an object", function (done) {
        let values = kofi.values(obj);
        assert.equal(values.length, 3);
        assert.equal(values[1], 30);
        return done();
    });
});

