import {htm, render} from "./kofi.js";

describe("htm", () => {
    let parent = null;

    beforeEach(() => {
        parent = document.createElement("div");
    });

    it("should render a basic element", () => {
        render(parent, htm`<div class="test"></div>`);
        expect(parent.querySelector(`div.test`)).toBeDefined();
    });
});
