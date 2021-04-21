import {each} from "../src/each.js";

describe("kofi.each <Array>", function () {
    const list = [0, 1, 2, 3];
    test("calls a function with each value in the array", function () {
        expect.assertions(4);
        return each(list, function (value, index, next) {
            expect(value).toBe(list[index]);
            return next();
        });
    });
    test("stops the loop when a false value is returned", function (done) {
        let executed = 0;
        expect.assertions(1);
        each(list, function (value, index, next) {
            executed = executed + 1;
            if (index === 2) {
                return next(false);
            }
            return next();
        }).then(function () {
            expect(executed).toBe(0);
        }).catch(function () {
            expect(executed).toBe(3);
            return done();
        });
    });
});

describe("kofi.each <Object>", function () {
    const obj = {
        name: "Bob",
        age: 30,
        city: "Tokio"
    };
    test("executes a function for ach pair key-value", function () {
        //const keys = Object.keys(obj);
        expect.assertions(3);
        return each(obj, function (key, value, next) {
            expect(value).toBe(obj[key]);
            return next();
        });
    });
    test("stops when a false boolean is returned", function (done) {
        let j = 0;
        expect.assertions(1);
        each(obj, function (key, value, next) {
            j = j + 1;
            if (j === 2) {
                return next(false);
            }
            return next();
        }).then(function () {
            expect(j).toBe(0);
        }).catch(function () {
            expect(j).toBe(2);
            return done();
        });
    });
});


