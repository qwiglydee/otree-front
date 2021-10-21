import { expect, fixture, nextFrame, oneEvent } from '@open-wc/testing';

import { Page } from '../src/page';


describe("ot-when", () => {
    let elem, page;
    describe("var", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-when="foo.bar"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("resets off when var is unset", async () => {
            page.reset();
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets off when var is partially unset", async () => {
            page.reset({ foo: {} });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets off when var is false", async () => {
            page.reset({ foo: { bar: false } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets off when var is empty", async () => {
            page.reset({ foo: { bar: "" } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets on when var is set", async () => {
            page.reset({ foo: { bar: "t" } });
            await nextFrame();
            expect(elem).to.be.displayed;
        });

        it("switches on when var is set", async () => {
            page.reset();
            await nextFrame();
            page.reset({ foo: { bar: "t" } });
            await nextFrame();
            expect(elem).to.be.displayed;
        });

        it("switches off when var is unset", async () => {
            page.reset({ foo: { bar: "t" } });
            await nextFrame();
            page.update({foo: undefined});
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("switches off when var is false", async () => {
            page.reset({ foo: { bar: "t" } });
            await nextFrame();
            page.update({ foo: { bar: false } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("switches off when var is empty", async () => {
            page.reset({ foo: { bar: "t" } });
            await nextFrame();
            page.reset({ foo: { bar: "" } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

    });

    describe("var==val", () => {
        beforeEach(async () => {
            elem = await fixture(`<div data-ot-when="foo.bar==baz"></div>`);
            page = new Page(document.body);
            page.init();
        });

        it("resets off when var is unset", async () => {
            page.reset();
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets off when var doesn't match", async () => {
            page.reset({ foo: { bar: "xxx" } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("resets on when var does match", async () => {
            page.reset({ foo: { bar: "baz" } });
            await nextFrame();
            expect(elem).to.be.displayed;
        });

        it("switches on when var does match", async () => {
            page.reset();
            await nextFrame();
            page.update({ foo: { bar: "baz" } });
            await nextFrame();
            expect(elem).to.be.displayed;
        });

        it("switches off when var doesn't match", async () => {
            page.reset({ foo: { bar: "baz" } });
            await nextFrame();
            page.update({ foo: { bar: "xxx" } });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });

        it("switches off when var is unset", async () => {
            debugger;
            page.reset({ foo: { bar: "baz" } });
            await nextFrame();
            page.update({ foo: undefined });
            await nextFrame();
            expect(elem).not.to.be.displayed;
        });
    });
});
