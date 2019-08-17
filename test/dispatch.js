let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("dispatch", function () {
    it("calls all listeners associated with the same event name", function (done) {
        let e = kofi.dispatch();
        let call1 = false, call2 = false;
        e.addListener("my-event", function (value) {
            call1 = true;
            assert.equal(value, true);
        });
        e.addListener("my-event", function (value) {
            call2 = true;
            assert.equal(value, true);
        });
        e.emit("my-event", true);
        return done();
    });

    it("does nothing if there is not listener registered", function (done) {
        let e = kofi.dispatch();
        e.emit("undef-event", null);
        return done();
    });

    it("removes a listener", function (done) {
        let e = kofi.dispatch();
        let call1 = false, call2 = false;
        let listener1 = function () {
            call1 = true;
        };
        let listener2 = function () {
            call2 = true;
        };
        e.addListener("foo", listener1);
        e.addListener("foo", listener2);
        e.removeListener("foo", listener1);
        e.emit("foo");
        assert.equal(call1, false);
        assert.equal(call2, true);
        return done();
    });

    it("removes all listeners", function (done) {
        let e = kofi.dispatch();
        let call1 = false, call2 = false;
        let listener1 = function () {
            call1 = true;
        };
        let listener2 = function () {
            call2 = true;
        };
        e.addListener("foo", listener1);
        e.addListener("foo", listener2);
        e.removeAllListeners("foo");
        e.emit("foo");
        assert.equal(call1, false);
        assert.equal(call2, false);
        return done();
    });
});

