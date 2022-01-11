import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { setText } from "../../src/utils/dom";
import { Page } from "../../src/page";
import { Changes } from "../../src/utils/changes";
import "../../src/directives/ot-text";

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

  describe("updating", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-text="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      setText(elem, "xxx");
      page.emitReset('obj');
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("changes by fld", async () => {
      page.emitUpdate(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ "obj.fld": "bar" }));
      await elementUpdated(elem);
      expect(elem).to.have.text("bar");
    });

    it("changes by obj", async () => {
      page.emitUpdate(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ obj: { fld: "bar" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("bar");
    });

    it("ignores unrelated fld", async () => {
      page.emitUpdate(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ "obj.fld2": "bar" }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");
    });

    it("ignores unrelated obj", async () => {
      page.emitUpdate(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ obj2: { fld: "bar" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");
    });

    it("clears by fld deletion", async () => {
      page.emitUpdate(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("clears by empty obj", async () => {
      page.emitUpdate(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });

    it("clears by obj deletion", async () => {
      page.emitUpdate(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.have.text("foo");

      page.emitUpdate(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect(elem).to.have.text("");
    });
  });
});
