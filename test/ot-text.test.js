import { expect, fixture, elementUpdated } from '@open-wc/testing';

import { Page } from '../src/page';

describe("ot-text errors", () => {
    let elem, page;

    it("raise for invalid path", async () => {
        elem = await fixture(`<div data-ot-text=".foo"></div>`);
        page = new Page();
        expect(()=>page.init()).to.throw();
    });

    it("raise for invalid chars", async () => {
        elem = await fixture(`<div data-ot-text="foo/bar"></div>`);
        page = new Page();
        expect(()=>page.init()).to.throw();
    });
});


describe("ot-text", () => {
    let body, elem, page;
    beforeEach(async () => {
        body = document.createElement('body');
        elem = await fixture(`<div data-ot-text="foo.bar"></div>`, {parentNode: body});
        page = new Page(body);
        page.init();
    });

    it("resets to empty for unset var", async () => {
        page.reset();
        await elementUpdated(elem);
        expect(elem).to.have.text("");
    });

    it("resets to text", async () => {
        page.reset({foo: {bar: "Bar"}});
        await elementUpdated(elem);
        expect(elem).to.have.text("Bar");
    });

    it("changes to empty for unset var", async () => {
        page.reset({foo: {bar: "Bar"}});
        await elementUpdated(elem);
        page.update({foo: undefined});
        await elementUpdated(elem);
        expect(elem).to.have.text("");
    });

    it("changes to text", async () => {
        page.reset();
        await elementUpdated(elem);
        page.update({foo: {bar: "Bar"}});
        await elementUpdated(elem);
        expect(elem).to.have.text("Bar");
    });

});
