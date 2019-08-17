let assert = require("assert");
let kofi = require("../dist/kofi.cjs.js");

describe("router", function () {
    it("should call matched routes", function (done) {
        let router = kofi.router();
        let route1 = false, route2 = false;
        router.route("/", function (req) {
            assert.equal(req.path, "/");
            assert.equal(req.pathname, "/");
            route1 = true;
        });
        router.route("/foo", function (req) {
            assert.equal(req.path, "/foo");
            assert.equal(req.pathname, "/foo");
            route2 = true;
        });
        router.load("/");
        router.load("/foo");
        assert.equal(route1, true);
        assert.equal(route2, true);
        return done();
    });

    it("should pass querystring values to routes", function (done) {
        let router = kofi.router();
        router.route("/", function (req) {
            assert.equal(req.query.bar, "baz");
            assert.equal(req.query.foo, "foz");
            return done();
        });
        router.load("/?foo=foz&bar=baz");
    });

    it("should pass parameters to routes", function (done) {
        let router = kofi.router();
        router.route("/foo/:bar/foo", function (req) {
            assert.equal(req.params.bar, "hello");
            return done();
        });
        router.load("/foo/hello/foo");
    });

    it("should call the not found route when no match is found", function (done) {
        let router = kofi.router();
        let route1 = false, route2 = false, route3 = false;
        router.route("/", function () {
            route1 = true;
        });
        router.route("/foo", function () {
            route2 = true;
        });
        router.notFound(function () {
            route3 = true;
        });
        router.load("/bar");
        assert.equal(route1, false);
        assert.equal(route2, false);
        assert.equal(route3, true);
        return done();
    });

    it("shoud call the catch-all route", function (done) {
        let router = kofi.router();
        let route1 = false, route2 = false, route3 = false;
        router.route("*", function (req, next) {
            route1 = true;
            return next();
        });
        router.route("/foo", function () {
            route2 = true;
        });
        router.route("*", function () {
            route3 = true;
        });
        router.load("/foo");
        assert.equal(route1, true);
        assert.equal(route2, true);
        assert.equal(route3, false);
        return done();

    });
});

