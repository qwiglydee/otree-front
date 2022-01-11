import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { setChild } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-img";


describe("ot-img", () => {
  let body, elem, page;
  const
    foo_img = new Image(),
    bar_img = new Image();

  describe("errors", () => {
    it("invalid path", async () => {
      elem = await fixture(`<div data-ot-img=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<div data-ot-img="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid img value");
  });

  describe("updating", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-img="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      setChild(elem, foo_img);
      page.emitReset('obj');
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("changes by fld", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": foo_img });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ "obj.fld": bar_img });
      await elementUpdated(elem);
      expect(elem).to.contain(bar_img);
    });

    it("changes by obj", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ obj: { fld: foo_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ obj: { fld: bar_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(bar_img);
    });

    it("ignores unrelated fld", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": foo_img });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ "obj.fld2": bar_img });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);
    });

    it("ignores unrelated obj", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ obj: { fld: foo_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ obj2: { fld: bar_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);
    });

    it("clears by fld deletion", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": foo_img });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("clears by empty obj", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ obj: { fld: foo_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("clears by obj deletion", async () => {
      page.emitReset('obj');
      await elementUpdated(elem);

      page.emitUpdate({ obj: { fld: foo_img } });
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.emitUpdate({ obj: undefined });
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });
  });
});
