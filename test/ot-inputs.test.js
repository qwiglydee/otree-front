import { expect, fixture, elementUpdated, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';

describe("ot-input", () => {
    let page, elem;

    describe("errors", () => {
        it("for invalid path", async () => {
            elem = await fixture(`<input data-ot-input=".foo"></div>`);
            page = new Page(document.body);
            expect(() => page.init()).to.throw();
        });

        it("for invalid chars", async () => {
            elem = await fixture(`<input data-ot-input="foo/bar"></div>`);
            page = new Page(document.body);
            expect(() => page.init()).to.throw();
        });

        it("for invalid expr for inputs", async () => {
            elem = await fixture(`<input data-ot-input="foo=bar"></div>`);
            page = new Page(document.body);
            expect(() => page.init()).to.throw();
        });

        it("for invalid expr for button", async () => {
            elem = await fixture(`<button data-ot-input="foo"></button>`);
            page = new Page(document.body);
            expect(() => page.init()).to.throw();
        });
    });


    describe("input", () => {
        beforeEach(async () => {
            elem = await fixture(`<input data-ot-input="foo"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            elem.disabled = false;
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
        });

        it("unfreezes", async () => {
            elem.disabled = true;
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
        });

        it("triggers response", async () => {
            elem.value = "123";
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123" });
        });
    });

    describe("select", () => {
        beforeEach(async () => {
            elem = await fixture(`<select data-ot-input="foo"><option value="foo1"></option><option value="foo2"></option><option value="foo2"></option></select>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            elem.disabled = false;
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
        });

        it("unfreezes", async () => {
            elem.disabled = true;
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
        });

        it("triggers response", async () => {
            elem.querySelector("option:nth-child(2)").selected = true;
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "foo2" });
        });
    });

    describe("textarea", () => {
        beforeEach(async () => {
            elem = await fixture(`<textarea data-ot-input="foo"></textarea>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            elem.disabled = false;
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
        });

        it("unfreezes", async () => {
            elem.disabled = true;
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
        });

        it("triggers response", async () => {
            elem.value = "123";
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123" });
        });
    });

    describe("button", () => {
        beforeEach(async () => {
            elem = await fixture(`<button data-ot-input="foo=123"></button>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            elem.disabled = false;
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
        });

        it("unfreezes", async () => {
            elem.disabled = true;
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
        });

        it("triggers response", async () => {
            elem.dispatchEvent(new MouseEvent('click'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123" });
        });
    });
});
