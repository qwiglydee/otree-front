import { expect, fixture, elementUpdated, aTimeout } from '@open-wc/testing';

import { Page } from '../src/page';

describe("ot-display", () => {
    let elem, page;

    describe("with delay and exposure", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-display-delay="100" data-ot-display-exposure="200"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("hides on reset", async () => {
            page.reset();
            await elementUpdated(elem);
            expect(elem).not.to.be.displayed;
        });

        it("displays", async () => {
            page.reset();
            await elementUpdated(elem);
            page.display();
            await elementUpdated(elem);
            expect(elem).not.to.be.displayed;
            await aTimeout(100);
            expect(elem).to.be.displayed;
            await aTimeout(200);
            expect(elem).not.to.be.displayed;
        });

        // it("hides on emergent reset", async () => {
        // });
    });

    describe("with delay only", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-display-delay="100"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("hides on reset", async () => {
            page.reset();
            await elementUpdated(elem);
            expect(elem).not.to.be.displayed;
        });

        it("displays", async () => {
            page.reset();
            await elementUpdated(elem);
            page.display();
            await elementUpdated(elem);
            expect(elem).not.to.be.displayed;
            await aTimeout(100);
            expect(elem).to.be.displayed;
            await aTimeout(1000);
            expect(elem).to.be.displayed;
        });

        // it("hides on emergent reset", async () => {
        // });
    });

    describe("with exposure only", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-display-exposure="200"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("hides on reset", async () => {
            page.reset();
            await elementUpdated(elem);
            expect(elem).not.to.be.displayed;
        });

        it("displays", async () => {
            page.reset();
            await elementUpdated(elem);
            page.display();
            await elementUpdated(elem);
            expect(elem).to.be.displayed;
            await aTimeout(200);
            expect(elem).not.to.be.displayed;
        });

        // it("hides on emergent reset", async () => {
        // });
    });
});
