import { expect, fixture, elementUpdated, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';

describe("ot-input", () => {
    let page, elem, detail;

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

        it("for invalid expr for custom", async () => {
            elem = await fixture(`<div data-ot-click data-ot-input="foo"></div>`);
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
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
            expect(elem).to.have.class('ot-disabled');
        });

        it("unfreezes", async () => {
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
            expect(elem).not.to.have.class('ot-disabled');
        });

        it("triggers on change", async () => {
            elem.value = "123";
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });
    });

    describe("select", () => {
        beforeEach(async () => {
            elem = await fixture(`<select data-ot-input="foo"><option value="foo1"></option><option value="foo2"></option><option value="foo2"></option></select>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
            expect(elem).to.have.class('ot-disabled');
        });

        it("unfreezes", async () => {
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
            expect(elem).not.to.have.class('ot-disabled');
        });

        it("triggers on change", async () => {
            elem.querySelector("option:nth-child(2)").selected = true;
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "foo2", error: undefined });
        });
    });

    describe("textarea", () => {
        beforeEach(async () => {
            elem = await fixture(`<textarea data-ot-input="foo"></textarea>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
            expect(elem).to.have.class('ot-disabled');
        });

        it("unfreezes", async () => {
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
            expect(elem).not.to.have.class('ot-disabled');
        });

        it("triggers on change", async () => {
            elem.value = "123";
            elem.dispatchEvent(new InputEvent('change'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });
    });

    describe("button", () => {
        beforeEach(async () => {
            elem = await fixture(`<button data-ot-input="foo=123"></button>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            page.freeze();
            await elementUpdated(elem);
            expect(elem).to.have.attr('disabled');
            expect(elem).to.have.class('ot-disabled');
        });

        it("unfreezes", async () => {
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem).not.to.have.attr('disabled');
            expect(elem).not.to.have.class('ot-disabled');
        });

        it("triggers on click", async () => {
            elem.dispatchEvent(new MouseEvent('click'));
            const { detail } = await oneEvent(page.root, 'ot.update');
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });
    });

    describe("custom", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-input="foo=123"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("freezes", async () => {
            page.freeze();
            await elementUpdated(elem);
            expect(elem.disabled).to.be.true;
            expect(elem).to.have.class('ot-disabled');
        });

        it("unfreezes", async () => {
            page.freeze();
            await elementUpdated(elem);
            page.unfreeze();
            await elementUpdated(elem);
            expect(elem.disabled).to.be.false;
            expect(elem).not.to.have.class('ot-disabled');
        });

        it("triggers on key", async () => {
            page.root.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });

        it("triggers on touch", async () => {
            elem.dispatchEvent(new TouchEvent('touchend'));
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });

        it("triggers on click", async () => {
            elem.dispatchEvent(new MouseEvent('click'));
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ foo: "123", error: undefined });
        });

        it("errors frozen on key", async () => {
            page.freeze();
            await elementUpdated(elem);
            page.root.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
            ({ detail } = await oneEvent(page.root, 'ot.error'));
            expect(detail.error).to.eq("frozen_input");
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ error: 'frozen_input' });
        });

        it("errors frozen on touch", async () => {
            page.freeze();
            await elementUpdated(elem);
            elem.dispatchEvent(new TouchEvent('touchend'));
            ({ detail } = await oneEvent(page.root, 'ot.error'));
            expect(detail.error).to.eq("frozen_input");
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ error: 'frozen_input' });
        });

        it("errors frozen on click", async () => {
            page.freeze();
            await elementUpdated(elem);
            elem.dispatchEvent(new MouseEvent('click'));
            ({ detail } = await oneEvent(page.root, 'ot.error'));
            expect(detail.error).to.eq("frozen_input");
            ({ detail } = await oneEvent(page.root, 'ot.update'));
            expect(detail.changes).to.deep.eq({ error: 'frozen_input' });
        });
    });
});
