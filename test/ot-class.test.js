import { expect, fixture, nextFrame, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-class", () => {
    let elem, page;
    beforeEach(async () => {
        elem = await fixture(`<div class="foo bar" data-ot-class="baz"></div>`);
        page = new Page(document.body);
        page.init();
    });

    it("resets to default classes", async () => {
        page.reset();
        await nextFrame();
        expect([...elem.classList]).to.deep.equal(['foo', 'bar']);
    });

    it("resets with added class", async () => {
        page.reset({baz: "baz0"});
        await nextFrame();
        expect([...elem.classList]).to.deep.equal(['foo', 'bar', 'baz0']);
    });

    it("changes class", async () => {
        page.reset({baz: "baz0"});
        await nextFrame();
        page.update({baz: "baz1"});
        await nextFrame();
        expect([...elem.classList]).to.deep.equal(['foo', 'bar', 'baz1']);
    });

    it("removes class", async () => {
        page.reset({baz: "baz0"});
        await nextFrame();
        page.update({baz: undefined});
        await nextFrame();
        expect([...elem.classList]).to.deep.equal(['foo', 'bar']);
    });
});
