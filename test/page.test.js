import { expect, fixture, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';


describe("Page controller", () => {

    describe("initializes", () => {

        it("with root elem", async () => {
            const elem = await fixture(`<div></div>`);
            let page = new Page(elem);

            expect(page.root).to.equal(elem);
        })

        it("with elem elem", async () => {
            let page = new Page();

            expect(page.root).to.equal(document.body);
        })

        it("with empty initial state", async () => {
            let page = new Page();
            expect(page.state).to.deep.equal({});
        });
    });
});


describe("Page controller", () => {
    let elem, page, detail;

    beforeEach(async () => {
        elem = await fixture(`<div></div>`);
        page = new Page(elem);
        detail = null;
    });

    it("starts", async () => {
        page.start();
        ({ detail } = await oneEvent(elem, 'ot.start'));
        expect(detail).to.deep.equal({ page: page });
    });

    it("resets", async () => {
        page.reset();
        expect(page.state).to.deep.equal({});
        ({ detail } = await oneEvent(elem, 'ot.reset'));
        expect(detail).to.deep.equal({ page: page });
    });

    it("updates empty", async () => {
        page.update({ 'foo': "Foo1", 'bar': "Bar1" });
        expect(page.state).to.deep.equal({ 'foo': "Foo1", 'bar': "Bar1" });
        ({ detail } = await oneEvent(elem, 'ot.update'));
        expect(detail).to.deep.equal({ page: page, change: { 'foo': "Foo1", 'bar': "Bar1" }});
    });

    it("updates existing", async () => {
        page.state = { 'foo': "Foo1", 'bar': "Bar1" };
        page.update({ 'bar': "Bar2", 'baz': "Baz2" });
        expect(page.state).to.deep.equal({ 'foo': "Foo1", 'bar': "Bar2", 'baz': "Baz2" });
        ({ detail } = await oneEvent(elem, 'ot.update'));
        expect(detail).to.deep.equal({ page: page, change: { 'bar': "Bar2", 'baz': "Baz2" }});
    });

    it("displays", async () => {
        page.display();
        ({ detail } = await oneEvent(elem, 'ot.display'));
        expect(detail).to.deep.equal({ page: page });
    });

    it("freezes", async () => {
        page.freeze();
        ({ detail } = await oneEvent(elem, 'ot.freeze'));
        expect(detail).to.deep.equal({ page: page, frozen: true });
    });

    it("unfreezes", async () => {
        page.unfreeze();
        ({ detail } = await oneEvent(elem, 'ot.freeze'));
        expect(detail).to.deep.equal({ page: page, frozen: false });
    });
});
