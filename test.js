import kofi from "./kofi.js";


describe("kofi.store", () => {
    it("should update the store", () => {
        const newStore = kofi.store({"count": 0});
        newStore.update({"count": 1});
        expect(newStore.get().count).toBe(1);
    });

    it("should call listeners when store changes", () => {
        const listener = jest.fn();
        const newStore = kofi.store({"count": 0});
        newStore.subscribe(listener);
        expect(listener).toHaveBeenCalledWith(newStore.get());
        newStore.update({"count": 1});
        expect(listener).toHaveBeenCalledWith(newStore.get());
    });
});

describe("kofi.retry", () => {
    it("should exit on the first completed iteration", () => {
        return kofi.retry(5, (index) => {
            return Promise.resolve(index);
        }).then(index => {
            expect(index).toBe(0);            
        });
    });

    it("should retry the fn if it fails", (done) => {
        const totalRetries = 5;
        let counter = 0;
        kofi.retry(totalRetries, () => {
            counter = counter + 1;
            return Promise.reject("Error");
        }).catch(() => {
            expect(counter).toBe(totalRetries);
            return done();
        });
    });
});

describe("kofi.each", () => {
    const list = [0, 1, 2, 3];
    it("calls a function with each value in the array", () => {
        expect.assertions(list.length);
        return kofi.each(list, (value, index) => {
            expect(value).toBe(list[index]);
            return Promise.resolve();
        });
    });

    it("stops the loop when the returned promise is rejected", done => {
        let executed = 0;
        expect.assertions(1);
        kofi.each(list, (value, index) => {
            executed = executed + 1;
            return index === 2 ? Promise.reject() : Promise.resolve();
        }).then(() => {
            expect(executed).toBe(0);
        }).catch(() => {
            expect(executed).toBe(3);
            return done();
        });
    });

    it("works also with objects", () => {
        const obj = {"a": 0, "b": 1};
        return kofi.each(obj, entry => {
            expect(obj[entry[0]]).toBe(entry[1]);
            return Promise.resolve();
        });
    });
});

describe("kofi.format", () => {
    it("replaces all {} expressions", () => {
        const str = kofi.format("my car is {{ color }}", {color: "blue"});
        expect(str.indexOf("color")).toBe(-1);
        expect(str.indexOf("blue")).not.toBe(-1);
    });
});

describe("kofi.timestamp", () => {
    it("returns a formatted timestamp", () => {
        const d = new Date();
        expect(kofi.timestamp("YYYY", d)).toBe(d.getFullYear().toString());
    });
});

describe("kofi.tempid", () => {
    it("generates unique ids", () => {
        expect(kofi.tempid()).not.toBe(kofi.tempid());
    });
});
