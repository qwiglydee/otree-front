import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-text", () => {
  let body, elem, page;

  describe("errors", () => {
    it("invalid path", async () => {
      elem = await fixture(`<div data-ot-text=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<div data-ot-text="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-text="fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ fld: "bar" });
      await elementUpdated(elem);
      expect(elem).to.have.text("bar");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ fld: null });
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");
    });
  });

  describe("obj.fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-text="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect(elem).to.have.text("bar");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ obj: { fld: null } });
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("skips missing", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ obj: {} });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");
    });
  });
});
