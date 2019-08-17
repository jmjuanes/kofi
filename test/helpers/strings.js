let assert = require("assert");
let kofi = require("../../dist/kofi.cjs.js");

describe("camelCase", function () {
    it("converts a string to camel-case format", function (done) {
        assert.equal(kofi.camelCase("hello world"), "helloWorld");
        return done();
    });

    it("keeps a string in camel-case format intact", function (done) {
        assert.equal(kofi.camelCase("helloWorld"), "helloWorld");
        return done();
    });
});

describe("capitalize", function () {
    it("capitalizes a string", function (done) {
        assert.equal(kofi.capitalize("hello world"), "Hello world");
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

describe("kebabCase", function () {
    it("converts a string to kebab-case format", function (done) {
        assert.equal(kofi.kebabCase("hello world"), "hello-world");
        return done();
    });
});

describe("repeat", function () {
    it("repeats a string a provided number of times", function (done) {
        assert.equal(kofi.repeat("x", 5), "xxxxx");
        assert.equal(kofi.repeat("abc", 3), "abcabcabc");
        return done();
    });
});

describe("snakeCase", function () {
    it("converts a string to snake-case format", function (done) {
        assert.equal(kofi.snakeCase("hello world"), "hello_world");
        return done();
    });
});

describe("timestamp", function () {
    it("returns a formatted timestamp", function (done) {
        let d = new Date();
        assert.equal(kofi.timestamp("YYYY"), d.getFullYear().toString());
        return done();
    });
});

describe("truncate", function () {
    it("truncates the string at the length provided", function (done) {
        let str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
        let truncated = kofi.truncate(str, {length: 10});
        assert.equal(truncated.length, 10);
        return done();
    });

    it("truncates the string by separator", function (done) {
        let str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
        let truncated = kofi.truncate(str, {length: 15, separator: " "});
        assert.equal(truncated.length, 14);
        return done();
    });
});

describe("uniqueId", function () {
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

