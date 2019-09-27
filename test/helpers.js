let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("concat", function () {
    it("concatenates arrays", function (done) {
        let arr1 = [1, 2, 3];
        let arr2 = [4, 5, 6, 7];
        let arr3 = [8];
        let concat = kofi.helpers.concat(arr1, arr2, arr3);
        assert.equal(Array.isArray(concat), true);
        assert.equal(concat.length, 8);
        assert.equal(concat[0], 1);
        assert.equal(concat[7], 8);
        assert.equal(concat[5], 6);
        return done();
    });
    it("concatenates non-array values", function (done) {
        let v1 = true;
        let v2 = null;
        let v3 = 0;
        let v4 = [1, 2, 3];
        let concat = kofi.helpers.concat(v1, v2, v3, v4);
        assert.equal(Array.isArray(concat), true);
        assert.equal(concat.length, 6);
        assert.equal(concat[0], true);
        assert.equal(concat[3], 1);
        return done();
    });
});

describe("each", function () {
    it("calls a function with each value in the array", function (done) {
        let list = [0, 1, 2, 3];
        kofi.helpers.each(list, function (value, index) {
            assert.equal(value, list[index]);
        });
        return done();
    });
    it("stops the loop when a false value is returned", function (done) {
        let list = [0, 1, 2, 3];
        let executed = 0;
        kofi.helpers.each(list, function (value, index) {
            executed = executed + 1;
            if (index === 2) {
                return false;
            }
        });
        assert.equal(executed, 3);
        return done();
    });
});

describe("fill", function () {
    it("fills an array with a number", function (done) {
        let filled = kofi.helpers.fill(5, 0);
        assert.equal(filled.length, 5);
        filled.forEach(function (value) {
            assert.equal(value, 0);
        });
        return done();
    });
    it("fills an array with a string", function (done) {
        let filled = kofi.helpers.fill(5, "abc");
        assert.equal(filled.length, 5);
        filled.forEach(function (value) {
            assert.equal(value, "abc");
        });
        return done();
    });
});

describe("max", function () {
    it("returns the max value in an array", function (done) {
        let array = [0, -10, 5, 2, 4, 0];
        assert.equal(kofi.helpers.max(array), 5);
        return done();
    });
});

describe("min", function () {
    it("returns the min value in an array", function (done) {
        let array = [-1, 0, 4, -5, 7];
        assert.equal(kofi.helpers.min(array), -5);
        return done();
    });
});

describe("pad", function () {
    it("adds zeros to the left side of the number", function (done) {
        assert.equal(kofi.helpers.pad(123, 4), "0123");
        return done();
    });
});

describe("range", function () {
    it("generates a correct array range", function (done) {
        let range = kofi.helpers.range(0, 5);
        assert.equal(range.length, 5);
        assert.equal(range[0], 0);
        assert.equal(range[4], 4);
        return done();
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
        kofi.helpers.each(obj, function (key, value) {
            assert.equal(keys[j], key);
            assert.equal(values[j], value);
            j = j + 1;;
        });
        assert.equal(j, 3);
        return done();
    });
    it("stops when a false boolean is returned", function (done) {
        let j = 0;
        kofi.helpers.each(obj, function () {
            j = j + 1;
            if (j === 2) {
                return false;
            }
        });
        assert.equal(j, 2);
        return done();
    });
});

describe("values", function () {
    it("returns all values of an object", function (done) {
        let obj = {
            name: "Bob",
            age: 30,
            city: "Tokio"
        };
        let values = kofi.helpers.values(obj);
        assert.equal(values.length, 3);
        assert.equal(values[1], 30);
        return done();
    });
});

describe("camelCase", function () {
    it("converts a string to camel-case format", function (done) {
        assert.equal(kofi.helpers.camelCase("hello world"), "helloWorld");
        return done();
    });

    it("keeps a string in camel-case format intact", function (done) {
        assert.equal(kofi.helpers.camelCase("helloWorld"), "helloWorld");
        return done();
    });
});

describe("capitalize", function () {
    it("capitalizes a string", function (done) {
        assert.equal(kofi.helpers.capitalize("hello world"), "Hello world");
        return done();
    });
});

describe("format", function () {
    it("replaces all handlebars values", function (done) {
        let str = kofi.helpers.format("my car is {{ color }}", {color: "blue"});
        assert.equal(str.indexOf("color"), -1);
        assert.notEqual(str.indexOf("blue"), -1);
        return done();
    });
});

describe("kebabCase", function () {
    it("converts a string to kebab-case format", function (done) {
        assert.equal(kofi.helpers.kebabCase("hello world"), "hello-world");
        return done();
    });
});

describe("repeat", function () {
    it("repeats a string a provided number of times", function (done) {
        assert.equal(kofi.helpers.repeat("x", 5), "xxxxx");
        assert.equal(kofi.helpers.repeat("abc", 3), "abcabcabc");
        return done();
    });
});

describe("snakeCase", function () {
    it("converts a string to snake-case format", function (done) {
        assert.equal(kofi.helpers.snakeCase("hello world"), "hello_world");
        return done();
    });
});

describe("timestamp", function () {
    it("returns a formatted timestamp", function (done) {
        let d = new Date();
        assert.equal(kofi.helpers.timestamp("YYYY"), d.getFullYear().toString());
        return done();
    });
});

describe("truncate", function () {
    it("truncates the string at the length provided", function (done) {
        let str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
        let truncated = kofi.helpers.truncate(str, {length: 10});
        assert.equal(truncated.length, 10);
        return done();
    });
    it("truncates the string by separator", function (done) {
        let str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
        let truncated = kofi.helpers.truncate(str, {length: 15, separator: " "});
        assert.equal(truncated.length, 14);
        return done();
    });
});

describe("tempd", function () {
    it("generates unique ids", function (done) {
        let ids = [];
        let j = 0;
        while (j < 100) {
            let id = kofi.helpers.tempid();
            assert.equal(ids.indexOf(id), -1);
            ids.push(id);
            j++
        }
        return done();
    });
});

describe("reverse", function() {
    it("reverses a string", function(done) {
        let str = "hello world";
        let reversed = kofi.helpers.reverse(str);
        assert.equal("dlrow olleh", reversed);
        return done();
    });
});

