import { expect, fixture, nextFrame, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-attr", () => {
    let elem, page;
    beforeEach(async () => {
        elem = await fixture(`<progress data-ot-attr-value="foo" data-ot-attr-max="bar"></progress>`);
        page = new Page(document.body);
        page.init();
    });

    it("resets", async () => {
        page.reset();
        await nextFrame();
        expect(elem).not.to.have.attr('value');
        expect(elem).not.to.have.attr('max');
    });

    it("resets to val", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await nextFrame();
        expect(elem).to.have.attr('value', "foo0");
        expect(elem).to.have.attr('max', "bar0");
    });

    it("adds attrs", async () => {
        debugger;
        page.reset();
        await nextFrame();
        page.update({ foo: "foo1", bar: "bar1" });
        await nextFrame();
        expect(elem).to.have.attr('value', "foo1");
        expect(elem).to.have.attr('max', "bar1");
    });

    it("removes attrs", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await nextFrame();
        page.update({ foo: undefined });
        await nextFrame();
        expect(elem).not.to.have.attr("value");
        expect(elem).to.have.attr('max', "bar0");
    });

    it("changes attrs", async () => {
        page.reset({ foo: "foo0", bar: "bar0" });
        await nextFrame();
        page.update({ foo: "foo1" });
        await nextFrame();
        expect(elem).to.have.attr('value', "foo1");
        expect(elem).to.have.attr('max', "bar0");
    });

});
