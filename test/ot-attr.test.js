import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-attr", () => {
  let body, elem, page;

  describe("errors", () => {
    let elem;

    it("invalid path", async () => {
      elem = await fixture(`<div data-ot-attr-value=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<div data-ot-attr-value="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<progress data-ot-attr-value="val" data-ot-attr-max="max"></progress>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("max");
      expect(elem).not.to.have.attr("value");
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ max: 100, val: 50 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ max: 100, val: 75 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "75");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ max: 100, val: 50 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ max: 100, val: null });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).not.to.have.attr("value");
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ max: 100, val: 50 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");
    });
  });

  describe("obj.fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<progress data-ot-attr-value="progr.val" data-ot-attr-max="progr.max"></progress>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("max");
      expect(elem).not.to.have.attr("value");
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ progr: { max: 100, val: 50 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ progr: { max: 100, val: 75 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "75");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ progr: { max: 100, val: 50 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ progr: { max: 100, val: null } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).not.to.have.attr("value");
    });

    it("skips missing", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ progr: { max: 100, val: 50 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ progr: { val: 75 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "75");
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ progr: { max: 100, val: 50 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");
    });
  });
});
