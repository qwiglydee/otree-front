import { html } from "lit";
import { expect, fixture, oneEvent, elementUpdated } from '@open-wc/testing';

import "../src/otree-tmpl";

function resetEvent(state) {
    return new CustomEvent(`otree-reset`, {bubbles: false, detail: {state}});
}

function updateEvent(update, state) {
    return new CustomEvent(`otree-updated`, {bubbles: false, detail: {state, update}});
}


describe("otree-div", () => {
    it("resets text content", async () => {
        const el = await fixture(`<otree-div><span>foo:\${foo}</span><span>bar:\${bar}</span></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        await elementUpdated(el);
        expect(el).shadowDom.to.equal(`<span>foo:Foo1</span><span>bar:Bar1</span>`);
    });

    it("updates text content", async () => {
        const el = await fixture(`<otree-div><span>foo:\${foo}</span><span>bar:\${bar}</span></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({foo:"Foo2"}, {foo: "Foo2", bar: "Bar1"}));
        await elementUpdated(el);
        expect(el).shadowDom.to.equal(`<span>foo:Foo2</span><span>bar:Bar1</span>`);
    });

    it("reupdates text content", async () => {
        const el = await fixture(`<otree-div><span>foo:\${foo}</span><span>bar:\${bar}</span></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({foo:"Foo2"}, {foo: "Foo2", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({bar:"Bar2"}, {foo: "Foo2", bar: "Bar2"}));
        await elementUpdated(el);
        expect(el).shadowDom.to.equal(`<span>foo:Foo2</span><span>bar:Bar2</span>`);
    });

    it("resets attributes", async () => {
        const el = await fixture(`<otree-div foo=\${foo} bar=\${bar}></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        await elementUpdated(el);
        expect(el).to.have.attribute('foo', 'Foo1');
        expect(el).to.have.attribute('bar', 'Bar1');
    });

    it("updates attributes", async () => {
        const el = await fixture(`<otree-div foo=\${foo} bar=\${bar}></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({foo:"Foo2"}, {foo: "Foo2", bar: "Bar1"}));
        await elementUpdated(el);
        expect(el).to.have.attribute('foo', 'Foo2');
        expect(el).to.have.attribute('bar', 'Bar1');
    });

    it("reupdates attributes", async () => {
        const el = await fixture(`<otree-div foo=\${foo} bar=\${bar}></otree-div>`);
        el.dispatchEvent(resetEvent({foo: "Foo1", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({foo:"Foo2"}, {foo: "Foo2", bar: "Bar1"}));
        el.dispatchEvent(updateEvent({bar:"Bar2"}, {foo: "Foo2", bar: "Bar2"}));
        await elementUpdated(el);
        expect(el).to.have.attribute('foo', 'Foo2');
        expect(el).to.have.attribute('bar', 'Bar2');
    });
});
