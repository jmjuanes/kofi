import {html, render} from "./kofi.js";

describe("html", () => {
    let parent = null;

    beforeEach(() => {
        parent = document.createElement("div");
    });

    it("should render a basic element", () => {
        render(parent, html`<div class="test"></div>`);
        expect(parent.querySelector(`div.test`)).toBeDefined();
    });

    it("should set text attributes", () => {
        const className = "test";
        render(parent, html`<button class="${className}"></button>`);
        expect(Array.from(parent.querySelector("button").classList)).toContain(className);
    });
    
    // it("should set boolean attributes", () => {
    //     const isChecked = true;
    //     const element = html`
    //         <input type="checkbox" ?checked="${isChecked}" />
    //     `;

    //     render(parent, element);
    //     expect(parent.querySelector("input").checked).toEqual(isChecked);
    // });

    it("should set events", () => {
        const handleClick1 = jest.fn();
        const handleClick2 = jest.fn();
        const template = html`
            <div>
                <div id="test1" onClick="${handleClick1}"></div>
                <div id="test2" onClick="${handleClick2}"></div>
            </div>
        `;

        render(parent, template);
        // parent.querySelector(`div#test1`).click();
        parent.querySelector(`div#test2`).click();
        expect(handleClick1).not.toHaveBeenCalled();
        expect(handleClick2).toHaveBeenCalled();
    });
});
