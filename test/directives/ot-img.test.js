import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Changes } from "../../src/utils/changes";

describe("ot-img", () => {
  let body, elem, page;
  const
    foo_img = new Image(),
    bar_img = new Image();
  foo_img.alt = "the_foo";
  bar_img.alt = "the_bar";

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
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("changes by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": foo_img }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ "obj.fld": bar_img }));
      await elementUpdated(elem);
      expect(elem).to.contain(bar_img);
    });

    it("changes by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: foo_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ obj: { fld: bar_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(bar_img);
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": foo_img }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ "obj.fld2": bar_img }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: foo_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ obj2: { fld: bar_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);
    });

    it("clears by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ "obj.fld": foo_img }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ "obj.fld": undefined }));
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("clears by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: foo_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ obj: {} }));
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("clears by obj deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update(new Changes({ obj: { fld: foo_img } }));
      await elementUpdated(elem);
      expect(elem).to.contain(foo_img);

      page.update(new Changes({ obj: undefined }));
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });
  });
});
