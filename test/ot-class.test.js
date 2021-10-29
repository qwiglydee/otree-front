import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-class", () => {
  let body, elem, page;

  describe("errors", () => {
    it("invalid path", async () => {
      elem = await fixture(`<div data-ot-class=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<div data-ot-class="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div class="cls1 cls2" data-ot-class="fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ fld: "bar" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ fld: null });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });
  });

  describe("obj.fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div class="cls1 cls2" data-ot-class="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ obj: { fld: null } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("skips missing", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ obj: { xxx: "xxx"} });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });
  });
});
