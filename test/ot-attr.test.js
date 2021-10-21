import { expect, fixture, elementUpdated } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-attr errors", () => {
    let elem, page;

    it("raise for invalid path", async () => {
        elem = await fixture(`<div data-ot-attr-value=".foo"></div>`);
        page = new Page(document.body);
        expect(()=>page.init()).to.throw();
    });

    it("raise for invalid chars", async () => {
        elem = await fixture(`<div data-ot-attr-value="foo/bar"></div>`);
        page = new Page(document.body);
        expect(()=>page.init()).to.throw();
    });
});

describe("ot-attr", () => {
    let elem, page;
    beforeEach(async () => {
        elem = await fixture(`<progress data-ot-attr-value="foo" data-ot-attr-max="bar"></progress>`);
        page = new Page(document.body);
        page.init();
    });

    it("resets", async () => {
        page.reset();
        await elementUpdated(elem);
        expect(elem).not.to.have.attr('value');
        expect(elem).not.to.have.attr('max');
    });

    it("resets to val", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await elementUpdated(elem);
        expect(elem).to.have.attr('value', "foo0");
        expect(elem).to.have.attr('max', "bar0");
    });

    it("adds attrs", async () => {
        debugger;
        page.reset();
        await elementUpdated(elem);
        page.update({ foo: "foo1", bar: "bar1" });
        await elementUpdated(elem);
        expect(elem).to.have.attr('value', "foo1");
        expect(elem).to.have.attr('max', "bar1");
    });

    it("removes attrs", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await elementUpdated(elem);
        page.update({ foo: undefined });
        await elementUpdated(elem);
        expect(elem).not.to.have.attr("value");
        expect(elem).to.have.attr('max', "bar0");
    });

    it("changes attrs", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await elementUpdated(elem);
        page.update({ foo: "foo1" });
        await elementUpdated(elem);
        expect(elem).to.have.attr('value', "foo1");
        expect(elem).to.have.attr('max', "bar0");
    });

});
