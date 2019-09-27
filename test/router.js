let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("router", function () {
    it("should call matched routes", function (done) {
        let router = kofi.router();
        let route1 = false, route2 = false;
        router.add("/", function (req) {
            assert.equal(req.path, "/");
            assert.equal(req.pathname, "/");
            route1 = true;
        });
        router.add("/foo", function (req) {
            assert.equal(req.path, "/foo");
            assert.equal(req.pathname, "/foo");
            route2 = true;
        });
        router.set("/");
        router.set("/foo");
        assert.equal(route1, true);
        assert.equal(route2, true);
        return done();
    });
    it("should pass querystring values to routes", function (done) {
        let router = kofi.router();
        router.add("/", function (req) {
            assert.equal(req.query.bar, "baz");
            assert.equal(req.query.foo, "foz");
            return done();
        });
        router.set("/?foo=foz&bar=baz");
    });
    it("should pass parameters to routes", function (done) {
        let router = kofi.router();
        router.add("/foo/:bar/foo", function (req) {
            assert.equal(req.params.bar, "hello");
            return done();
        });
        router.set("/foo/hello/foo");
    });
    it("shoud call the catch-all route", function (done) {
        let router = kofi.router();
        let route1 = false, route2 = false, route3 = false;
        router.add("*", function (req, next) {
            route1 = true;
            return next();
        });
        router.add("/foo", function () {
            route2 = true;
        });
        router.add("*", function () {
            route3 = true;
        });
        router.set("/foo");
        assert.equal(route1, true);
        assert.equal(route2, true);
        assert.equal(route3, false);
        return done();
    });
});

