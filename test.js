import {describe, it} from "node:test";
import assert from "node:assert";
import kofi from "./kofi.js";

describe("kofi.template", () => {
    const jsx = (literal, ...values) => {
        return kofi.template((t, p, ...c) => ([t, p, c]), literal, values)[0];
    };
    const Component = () => {};

    it("sould return 'undefined' on empty string", () => {
        assert.equal(jsx``, undefined);
    });

    it("should return the provided string if no HTML code is present", () => {
        assert.equal(jsx`Hello World`, "Hello World");
    });

    it("should return single VDOM nodes", () => {
        assert.deepStrictEqual(jsx`<div />`, ["div", {}, []]);
        assert.deepStrictEqual(jsx`<span />`, ["span", {}, []]);
        assert.deepStrictEqual(jsx`<h1 />`, ["h1", {}, []]);
        assert.deepStrictEqual(jsx`<foo />`, ["foo", {}, []]);
    });

    it("should return nodes with empty content", () => {
        assert.deepStrictEqual(jsx`<div></div>`, ["div", {}, []]);
    });

    it("should return nodes with text content", () => {
        assert.deepStrictEqual(jsx`<div>Hello</div>`, ["div", {}, ["Hello"]]);
    });

    it("should return nodes with dynamic content", () => {
        assert.deepStrictEqual(jsx`<div>Hello ${"World"}</div>`, ["div", {}, ["Hello ", "World"]]);
    });

    it("should return nodes with inner nodes", () => {
        assert.deepStrictEqual(jsx`<div>Hello <b>Bob</b></div>`, ["div", {}, ["Hello ", ["b", {}, ["Bob"]]]]);
    });

    it("should parse string props", () => {
        assert.deepStrictEqual(jsx`<div align="center">Hello</div>`, ["div", {align: "center"}, ["Hello"]]);
        assert.deepStrictEqual(jsx`<div align="center"/>`, ["div", {align: "center"}, []]);
        assert.deepStrictEqual(jsx`<a title="Hello World"/>`, ["a", {title: "Hello World"}, []]);
    });

    it("should parse empty string props", () => {
        assert.deepStrictEqual(jsx`<a href="">Hello</a>`, ["a", {href: ""}, ["Hello"]]);
    });

    it("should parse boolean props", () => {
        assert.deepStrictEqual(jsx`<input disabled />`, ["input", {disabled: true}, []]);
        assert.deepStrictEqual(jsx`<input disabled/>`, ["input", {disabled: true}, []]);
        assert.deepStrictEqual(jsx`<a disabled></a>`, ["a", {disabled: true}, []]);
    });

    it("should parse props with dynamic values", () => {
        assert.deepStrictEqual(jsx`<input disabled=${false} />`, ["input", {disabled: false}, []]);
        assert.deepStrictEqual(jsx`<a href="${"localhost"}" />`, ["a", {href: "localhost"}, []]);
        assert.deepStrictEqual(jsx`<div style="${{color: "white"}}">Hello</div>`, ["div", {style: {color: "white"}}, ["Hello"]]);
    });

    it("should return nodes with components as tags", () => {
        assert.deepStrictEqual(jsx`<${Component}>Hello</${Component}>`, [Component, {}, ["Hello"]]);
    });

    it("should parse with multines", () => {
        const vdom = jsx`
            <div className="foo">bar</div>
        `;
        assert.deepStrictEqual(vdom, ["div", {className: "foo"}, ["bar"]]);
    });

    it("should expand props", () => {
        assert.deepStrictEqual(jsx`<a ...${{align: "center"}}></a>`, ["a", {align: "center"}, []]);
    });
});

describe("kofi.state", () => {
    it("should allow to register a function that will be called when the state changes", async () => {
        const state = kofi.state({value: 1});
        state.$on(() => {
            assert.equal(state.value, 2);
        });
        assert.equal(state.value, 1);
        await state.$update({value: 2});
    });

    it("should group changes and only call the listener method once", async () => {
        const state = kofi.state({value: 1});
        state.$on(() => {
            assert.equal(state.value, 3);
        });
        state.$update({value: 2});
        await state.$update({value: 3});
    });

    it("should remove listeners", async () => {
        const state = kofi.state({value: 1});
        const onChange = () => {
            assert.equal(state.value, 2);
        };
        state.$on(onChange);
        await state.$update({value: 2});
        state.$off(onChange);
        await state.$update({value: 3});
    });
});
