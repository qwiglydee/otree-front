import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Changes } from "../../src/utils/changes";

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

  describe("updating `var`", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": true }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": false }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: true } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": true }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld2": false }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: true } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj2: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("hides by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: true } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by obj deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: true } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("updating `var==val`", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld==foo"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": "bar" }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: { fld: "bar" } }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld2": "bar" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj2: { fld: "bar" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("hides by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": "foo" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by obj deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: "foo" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("updating `var==false`", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld==false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": false }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": true }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: { fld: true } }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": false }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld2": "bar" }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj2: { fld: "bar" } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("hides by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": false }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("hides by obj deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: false } }));
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

});