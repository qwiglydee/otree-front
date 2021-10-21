import { expect, fixture, elementUpdated } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-class errors", () => {
    let elem, page;

    it("raise for invalid path", async () => {
        elem = await fixture(`<div data-ot-class=".foo"></div>`);
        page = new Page(document.body);
        expect(()=>page.init()).to.throw();
    });

    it("raise for invalid chars", async () => {
        elem = await fixture(`<div data-ot-class="foo/bar"></div>`);
        page = new Page(document.body);
        expect(()=>page.init()).to.throw();
    });
});


describe("ot-class", () => {
    let elem, page;
    beforeEach(async () => {
        elem = await fixture(`<div class="foo bar" data-ot-class="baz"></div>`);
        page = new Page(document.body);
        page.init();
    });

    it("resets to default classes", async () => {
        page.reset();
        await elementUpdated(elem);
        expect([...elem.classList]).to.deep.equal(['foo', 'bar']);
    });

    it("resets with added class", async () => {
        page.reset({baz: "baz0"});
        await elementUpdated(elem);
        expect([...elem.classList]).to.deep.equal(['foo', 'bar', 'baz0']);
    });

    it("changes class", async () => {
        page.reset({baz: "baz0"});
        await elementUpdated(elem);
        page.update({baz: "baz1"});
        await elementUpdated(elem);
        expect([...elem.classList]).to.deep.equal(['foo', 'bar', 'baz1']);
    });

    it("removes class", async () => {
        page.reset({baz: "baz0"});
        await elementUpdated(elem);
        page.update({baz: undefined});
        await elementUpdated(elem);
        expect([...elem.classList]).to.deep.equal(['foo', 'bar']);
    });
});
