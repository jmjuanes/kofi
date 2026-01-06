import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import kofi from "./index.js";

const createDOM = (html = '<!DOCTYPE html><html><body></body></html>') => {
    // 1. create the new JSDOM instance
    const dom = new JSDOM(html, {
        url: "http://localhost",
        pretendToBeVisual: true,
    });
    // 2. set globals like in a web browser
    global.window = dom.window;
    global.document = dom.window.document;
    // 3. return the dom instance
    return dom;
};

describe("kofi.html", () => {
    const html = kofi.html;
    const e = (type, props, children) => ({ type, props, children });

    it("sould return 'undefined' on empty string", () => {
        assert.equal(html``, undefined);
    });

    it("should return the provided string if no HTML code is present", () => {
        assert.equal(html`Hello World`, "Hello World");
    });

    it("should return single VDOM nodes", () => {
        assert.deepStrictEqual(html`<div />`, e("div", {}, []));
        assert.deepStrictEqual(html`<span />`, e("span", {}, []));
        assert.deepStrictEqual(html`<h1 />`, e("h1", {}, []));
        assert.deepStrictEqual(html`<foo />`, e("foo", {}, []));
    });

    it("should return nodes with empty content", () => {
        assert.deepStrictEqual(html`<div></div>`, e("div", {}, []));
    });

    it("should return nodes with text content", () => {
        assert.deepStrictEqual(html`<div>Hello</div>`, e("div", {}, ["Hello"]));
    });

    it("should return nodes with dynamic content", () => {
        assert.deepStrictEqual(html`<div>Hello ${"World"}</div>`, e("div", {}, ["Hello ", "World"]));
    });

    it("should return nodes with inner nodes", () => {
        assert.deepStrictEqual(
            html`<div>Hello <b>Bob</b></div>`,
            e("div", {}, ["Hello ", e("b", {}, ["Bob"])]),
        );
    });

    it("should parse string props", () => {
        assert.deepStrictEqual(html`<div align="center">Hello</div>`, e("div", {align: "center"}, ["Hello"]));
        assert.deepStrictEqual(html`<div align="center"/>`, e("div", {align: "center"}, []));
        assert.deepStrictEqual(html`<a title="Hello World"/>`, e("a", {title: "Hello World"}, []));
    });

    it("should parse empty string props", () => {
        assert.deepStrictEqual(html`<a href="">Hello</a>`, e("a", {href: ""}, ["Hello"]));
    });

    it("should parse boolean props", () => {
        assert.deepStrictEqual(html`<input disabled />`, e("input", {disabled: true}, []));
        assert.deepStrictEqual(html`<input disabled/>`, e("input", {disabled: true}, []));
        assert.deepStrictEqual(html`<a disabled></a>`, e("a", {disabled: true}, []));
    });

    it("should parse props with dynamic values", () => {
        assert.deepStrictEqual(html`<input disabled=${false} />`, e("input", {disabled: false}, []));
        assert.deepStrictEqual(html`<a href="${"localhost"}" />`, e("a", {href: "localhost"}, []));
        assert.deepStrictEqual(
            html`<div style="${{color: "white"}}">Hello</div>`,
            e("div", {style: {color: "white"}}, ["Hello"]),
        );
    });

    // it("should return nodes with components as tags", () => {
    //     assert.deepStrictEqual(html`<${Component}>Hello</${Component}>`, e(Component, {}, ["Hello"]));
    // });

    it("should parse with multilines", () => {
        const vdom = html`
            <div
                className="foo"
                align="center"
            >bar</div>
        `;
        assert.deepStrictEqual(vdom, e("div", {className: "foo", align: "center"}, ["bar"]));
    });

    it("should expand props", () => {
        assert.deepStrictEqual(html`<a ...${{align: "center"}}></a>`, e("a", {align: "center"}, []));
    });

    it("should support 'class' attribute", () => {
        const result = html`
            <div class="foo">bar</div>
        `;
        assert.deepStrictEqual(result, e("div", {class: "foo"}, ["bar"]));
    });

    it("should support functions as event listeners", () => {
        const listener = () => null;
        assert.deepStrictEqual(
            html`<button onClick="${listener}">Click me</button>`,
            e("button", { onClick: listener }, [ "Click me" ]),
        );
    });

    it("should support conditional rendering", () => {
        const component = condition => html`<div>${condition ? html`Hello World` : ""}</div>`;
        assert.deepStrictEqual(component(true), e("div", {}, ["Hello World"]));
        assert.deepStrictEqual(component(false), e("div", {}, []));
    });

    it("should support components", () => {
        const SayHello = name => html`<span>Hello ${name}</span>`;
        assert.deepStrictEqual(
            html`<div>${SayHello("Bob")}</div>`,
            e("div", {}, [
                e("span", {}, ["Hello ", "Bob"]),
            ]),
        );
    });

    it("should support loops", () => {
        const items = ["hello", "bob"];
        const result = html`
            <div align="center">
                ${items.map(item => html`<span>${item}</span>`)}
            </div>
        `;
        assert.equal(result.children.length, 2);
        items.forEach((item, index) => {
            assert.deepStrictEqual(result.children[index], e("span", {}, [ item ]));
        });
    });
});

describe("kofi.render", () => {
    let root = null;
    beforeEach(() => {
        createDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`);
        root = document.querySelector("#root");
    });

    it("should render the provided vdom", () => {
        kofi.render(kofi.html`<span>Hello World</span>`, root);
        assert.equal(root.querySelector("span")?.textContent, "Hello World");
    });

    it("should update previously rendered vdom elements", () => {
        kofi.render(kofi.html`<div>Hello Bob</div>`, root);
        assert.equal(root.querySelector("div")?.textContent, "Hello Bob");
        kofi.render(kofi.html`<div>Hello Susan</div>`, root);
        assert.equal(root.querySelector("div")?.textContent, "Hello Susan");
    });

    it("should update child nodes", () => {
        kofi.render(kofi.html`
            <div align="center">
                <span>Hello World</span>
            </div>
        `, root);
        assert.equal(root.querySelector("span")?.textContent, "Hello World");
        kofi.render(kofi.html`
            <div>
                <button>Button 1</button>
                <button>Button 2</button>
                <div className="separator">Separator</div>
                <button>Button 3</button>
            </div>    
        `, root);
        const buttons = Array.from(root.querySelectorAll("button"));
        assert.equal(buttons.length, 3);
        assert.equal(buttons[1].textContent, "Button 2");
        assert.equal(buttons[2].textContent, "Button 3");
        assert.equal(buttons[2].previousSibling.textContent, "Separator");
    });
});

describe("kofi.state", () => {
    it("should allow to register a function that will be called when the state changes", async () => {
        const state = kofi.state({ value: 1 });
        state.on(currentState => {
            assert.equal(currentState.value, 2);
        });
        assert.equal(state.getState().value, 1);
        await state.setState({ value: 2 });
    });

    it("should group changes and only call the listener method once", async () => {
        const state = kofi.state({ value: 1 });
        state.on(currentState => {
            assert.equal(currentState.value, 3);
        });
        state.setState({ value: 2 });
        await state.setState({ value: 3 });
    });

    it("should support functions in setState", async () => {
        const state = kofi.state({ value: 1 });
        state.on(currentState => {
            assert.equal(currentState.value, 5);
        });
        await state.setState(prevState => {
            return { value: prevState.value + 4 };
        });
    });

    it("should remove listeners", async () => {
        const state = kofi.state({ value: 1 });
        const onChange = currentState => {
            assert.equal(currentState.value, 2);
        };
        state.on(onChange);
        await state.setState( {value: 2 });
        state.off(onChange);
        await state.setState({ value: 3 });
    });
});

describe("kofi.emitter", () => {
    it("should allow to register message listeners", () => {
        const bus = kofi.emitter();
        bus.on("foo", data => {
            assert.equal(data, "bar");
        });
        bus.emit("foo", "bar");
    });

    it("should allow to remove message listeners", () => {
        const bus = kofi.emitter();
        const listener = data => assert.equal(data, "bar");
        bus.on("foo", listener);
        bus.emit("foo", "bar");
        bus.off("foo", listener);
        bus.emit("foo", "barz");
    });

    it("should allow to initialize events", () => {
        const bus = kofi.emitter({
            "foo": data => {
                assert.equal(data, "bar");
            },
        });
        bus.emit("foo", "bar");
    });
});
