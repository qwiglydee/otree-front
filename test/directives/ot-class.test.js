import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Changes } from "../../src/utils/changes";

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

  describe("updating", () => {
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

    it("changes by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ "obj.fld": "bar" }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("changes by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ obj: { fld: "bar" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ "obj.fld2": "bar" }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ obj2: { fld: "bar" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });

    it("clears by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("clears by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("clears by obj deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.update(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });
  });
});
