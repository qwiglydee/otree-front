import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-when", () => {
  let body, elem, page;

  describe("errors", () => {
    it("for invalid path", async () => {
      elem = await fixture(`<div data-ot-when=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("for invalid chars", async () => {
      elem = await fixture(`<div data-ot-when="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("for invalid expr", async () => {
      elem = await fixture(`<div data-ot-when="foo=bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ fld: false });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides for null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ fld: null });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });
  });

  describe("fld==val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="fld==foo"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ fld: "bar" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });
  });

  describe("obj.fld==val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld==foo"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("skips missing", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ obj: { xxx: "xxx" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });
  });

  describe("fld==false", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="fld==false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ fld: true });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });
  });
});
