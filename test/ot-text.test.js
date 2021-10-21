import { expect, fixture, nextFrame, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-text", () => {
    let elem, page;
    beforeEach(async () => {
        elem = await fixture(`<div data-ot-text="foo.bar"></div>`);
        page = new Page(document.body);
        page.init();
    });

    it("resets to empty for unset var", async () => {
        page.reset();
        await nextFrame();
        expect(elem).to.have.text("");
    });

    it("resets to text", async () => {
        page.reset({foo: {bar: "Bar"}});
        await nextFrame();
        expect(elem).to.have.text("Bar");
    });

    it("changes to empty for unset var", async () => {
        page.reset({foo: {bar: "Bar"}});
        await nextFrame();
        page.update({foo: undefined});
        await nextFrame();
        expect(elem).to.have.text("");
    });

    it("changes to text", async () => {
        page.reset();
        await nextFrame();
        page.update({foo: {bar: "Bar"}});
        await nextFrame();
        expect(elem).to.have.text("Bar");
    });

});
