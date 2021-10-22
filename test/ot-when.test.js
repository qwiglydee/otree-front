import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-when errors", () => {
  let elem, page;

  it("for invalid path", async () => {
    elem = await fixture(`<div data-ot-when=".foo"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });

  it("for invalid chars", async () => {
    elem = await fixture(`<div data-ot-when="foo/bar"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });

  it("for invalid expr", async () => {
    elem = await fixture(`<div data-ot-when="foo=bar"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });
});

describe("ot-when", () => {
  let body, elem, page;

  describe("var", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="foo.bar"></div>`, { parentNode: body });
      page = new Page(body);
      page.init();
    });

    it("resets off when var is unset", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets off when var is partially unset", async () => {
      page.reset({ foo: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets off when var is false", async () => {
      page.reset({ foo: { bar: false } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets off when var is empty", async () => {
      page.reset({ foo: { bar: "" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets on when var is set", async () => {
      page.reset({ foo: { bar: "t" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on when var is set", async () => {
      page.reset();
      await elementUpdated(elem);
      page.reset({ foo: { bar: "t" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off when var is unset", async () => {
      page.reset({ foo: { bar: "t" } });
      await elementUpdated(elem);
      page.update({ foo: undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off when var is false", async () => {
      page.reset({ foo: { bar: "t" } });
      await elementUpdated(elem);
      page.update({ foo: { bar: false } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off when var is empty", async () => {
      page.reset({ foo: { bar: "t" } });
      await elementUpdated(elem);
      page.reset({ foo: { bar: "" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var==val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="foo.bar==baz"></div>`, { parentNode: body });
      page = new Page(body);
      page.init();
    });

    it("resets off when var is unset", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets off when var doesn't match", async () => {
      page.reset({ foo: { bar: "xxx" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets on when var does match", async () => {
      page.reset({ foo: { bar: "baz" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on when var does match", async () => {
      page.reset();
      await elementUpdated(elem);
      page.update({ foo: { bar: "baz" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off when var doesn't match", async () => {
      page.reset({ foo: { bar: "baz" } });
      await elementUpdated(elem);
      page.update({ foo: { bar: "xxx" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off when var is unset", async () => {
      debugger;
      page.reset({ foo: { bar: "baz" } });
      await elementUpdated(elem);
      page.update({ foo: undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
