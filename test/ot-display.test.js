import { expect, fixture, elementUpdated, aTimeout } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-display errors", () => {
  let elem, page;

  it("raise for non numeric delay", async () => {
    debugger;
    elem = await fixture(`<div data-ot-display-delay="xxx"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });

  it("raise for non-numerc exposure", async () => {
    elem = await fixture(`<div data-ot-display-exposure="xxx"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });
});

describe("ot-display", () => {
  let body, elem, page;

  describe("with delay and exposure", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-display-delay="100" data-ot-display-exposure="200"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
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
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-display-delay="100"></div>`, { parentNode: body });
      page = new Page(body);
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
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-display-exposure="200"></div>`, { parentNode: body });
      page = new Page(body);
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

    it("cancels show/hides timers on emergent reset");
  });
});
