import {store} from "../src/store.js";

describe("kofi.store", () => {
    it("should update the store", () => {
        const newStore = store({"count": 0});
        newStore.update({"count": 1});
        expect(newStore.get().count).toBe(1);
    });

    it("should call listeners when store changes", () => {
        const listener = jest.fn();
        const newStore = store({"count": 0});
        newStore.subscribe(listener);
        expect(listener).toHaveBeenCalledWith(newStore.get());
        newStore.update({"count": 1});
        expect(listener).toHaveBeenCalledWith(newStore.get());
    });
});
