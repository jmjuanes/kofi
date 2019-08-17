let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("queue", function () {
    it("executes all functions provided", function (done) {
        let q = kofi.queue();
        let e1 = false, e2 = false, e3 = false;
        q.then(function (next) {
            e1 = true;
            return next();
        });
        q.then(function (next) {
            e2 = true;
            return next();
        });
        q.then(function (next) {
            return setTimeout(function () {
                e3 = true;
                return next();
            }, 100);
        });
        q.catch(function (error) {
            return done(new Error("ERROR RUNNING QUEUE"));
        });
        q.finish(function () {
            assert.equal(e1, true);
            assert.equal(e2, true);
            assert.equal(e3, true);
            return done();
        });
    });
    it("calls the provided function with catch if there is an error in a task", function (done) {
        let q = kofi.queue();
        let e1 = false, e2 = false, e3 = false;
        q.then(function (next) {
            e1 = true;
            return next();
        });
        q.then(function (next) {
            e2 = true;
            return next(new Error(""));
        });
        q.then(function (next) {
            e3 = true;
            return next();
        });
        q.finish(function () {
            return done(new Error(""));
        });
        q.catch(function (error) {
            assert.equal(typeof error, "object");
            assert.equal(e1, true);
            assert.equal(e2, true);
            assert.equal(e3, false);
            return done();
        });
    });
});

