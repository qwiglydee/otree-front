import { html } from "lit";
import { expect, fixture, oneEvent, elementUpdated } from '@open-wc/testing';

import "../src/otree-tmpl";

function resetEvent(state) {
    return new CustomEvent(`otree-reset`, {bubbles: false, detail: {state}});
}

function updateEvent(update, state) {
    if (state === undefined) {
        state = Object.assign({}, update);
    }
    return new CustomEvent(`otree-updated`, {bubbles: false, detail: {state, update}});
}


describe("otree-switch", () => {
    let el;

    beforeEach(async () => {
        el = await fixture(`<otree-div when="\${foo}"></otree-div>`);
    });

    describe("resets", () => {
        it("off by missing", async () => {
            el.dispatchEvent(resetEvent({}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("off by false", async () => {
            el.dispatchEvent(resetEvent({foo: false}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("off by empty", async () => {
            el.dispatchEvent(resetEvent({foo: ""}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("on by true", async () => {
            el.dispatchEvent(resetEvent({foo: true}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });

        it("on by nonempty", async () => {
            el.dispatchEvent(resetEvent({foo: "t"}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });
    });

    describe("switches", () => {
        it("on by true", async () => {
            el.dispatchEvent(resetEvent({}));
            el.dispatchEvent(updateEvent({foo: true}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });

        it("on by nonempty", async () => {
            el.dispatchEvent(resetEvent({}));
            el.dispatchEvent(updateEvent({foo: "t"}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });

        it("off by false", async () => {
            el.dispatchEvent(resetEvent({}));
            el.dispatchEvent(updateEvent({foo: false}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("off by empty", async () => {
            el.dispatchEvent(resetEvent({foo: true}));
            el.dispatchEvent(updateEvent({foo: ""}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("off by missing", async () => {
            el.dispatchEvent(resetEvent({foo: true}));
            el.dispatchEvent(updateEvent({foo: undefined}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });
    });
});

describe("otree-match", () => {
    let el;

    beforeEach(async () => {
        el = await fixture(`<otree-div when="\${foo}" match="Foo"></otree-div>`);
    });

    describe("resets", () => {
        it("on", async () => {
            el.dispatchEvent(resetEvent({foo: "Foo"}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });

        it("off", async () => {
            el.dispatchEvent(resetEvent({foo: "Boo"}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });

        it("off by missing", async () => {
            el.dispatchEvent(resetEvent({}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });
    });

    describe("switches", () => {
        it("on", async () => {
            el.dispatchEvent(resetEvent({}));
            el.dispatchEvent(updateEvent({foo: "Foo"}));
            await elementUpdated(el);
            expect(el).to.be.displayed;
        });

        it("off", async () => {
            el.dispatchEvent(resetEvent({foo: "Foo"}));
            el.dispatchEvent(updateEvent({foo: "Boo"}));
            await elementUpdated(el);
            expect(el).not.to.be.displayed;
        });
    });

});

describe("otree-match bool", () => {
    let el;

    describe("true", () => {
        beforeEach(async () => {
            el = await fixture(`<otree-div when="\${foo}" match="true"></otree-div>`);
        });

        describe("resets", () => {
            it("on", async () => {
                el.dispatchEvent(resetEvent({foo: true}));
                await elementUpdated(el);
                expect(el).to.be.displayed;
            });

            it("off", async () => {
                el.dispatchEvent(resetEvent({foo: false}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by missing", async () => {
                el.dispatchEvent(resetEvent({}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by empty", async () => {
                el.dispatchEvent(resetEvent({foo: ""}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });
        });

        describe("switches", () => {
            it("on", async () => {
                el.dispatchEvent(resetEvent({}));
                el.dispatchEvent(updateEvent({foo: true}));
                await elementUpdated(el);
                expect(el).to.be.displayed;
            });

            it("off", async () => {
                el.dispatchEvent(resetEvent({foo: true}));
                el.dispatchEvent(updateEvent({foo: false}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by missing", async () => {
                el.dispatchEvent(resetEvent({foo: true}));
                el.dispatchEvent(updateEvent({foo: undefined}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by empty", async () => {
                el.dispatchEvent(resetEvent({foo: true}));
                el.dispatchEvent(updateEvent({foo: ""}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });
        });
    });

    describe("false", () => {
        beforeEach(async () => {
            el = await fixture(`<otree-div when="\${foo}" match="false"></otree-div>`);
        });

        describe("resets", () => {
            it("on", async () => {
                el.dispatchEvent(resetEvent({foo: false}));
                await elementUpdated(el);
                expect(el).to.be.displayed;
            });

            it("off", async () => {
                el.dispatchEvent(resetEvent({foo: true}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by missing", async () => {
                el.dispatchEvent(resetEvent({}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by empty", async () => {
                el.dispatchEvent(resetEvent({foo: ""}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });
        });

        describe("switches", () => {
            it("on", async () => {
                el.dispatchEvent(resetEvent({}));
                el.dispatchEvent(updateEvent({foo: false}));
                await elementUpdated(el);
                expect(el).to.be.displayed;
            });

            it("off", async () => {
                el.dispatchEvent(resetEvent({foo: false}));
                el.dispatchEvent(updateEvent({foo: true}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by missing", async () => {
                el.dispatchEvent(resetEvent({foo: false}));
                el.dispatchEvent(updateEvent({foo: undefined}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });

            it("off by empty", async () => {
                el.dispatchEvent(resetEvent({foo: false}));
                el.dispatchEvent(updateEvent({foo: ""}));
                await elementUpdated(el);
                expect(el).not.to.be.displayed;
            });
        });
    });
});