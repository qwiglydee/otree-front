import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-img", () => {
  let body, elem, page;
  const foo = new Image(),
    bar = new Image();
  foo.alt = "the_foo";
  bar.alt = "the_bar";

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

  describe("fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-img="fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: foo });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ fld: bar });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_bar']");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: foo });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ fld: null });
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ fld: foo });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");
    });
  });

  describe("obj.fld", () => {
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

    it("changes", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: foo } });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ obj: { fld: bar } });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_bar']");
    });

    it("deletes null", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: foo } });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ obj: { fld: null } });
      await elementUpdated(elem);
      expect(elem).to.be.empty;
    });

    it("skips missing", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: foo } });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ obj: { xxx: "xxx"} });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");
    });

    it("ignores unrelated", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ obj: { fld: foo } });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");

      page.update({ xxx: "xxx" });
      await elementUpdated(elem);
      expect(elem).to.contain("img[alt='the_foo']");
    });
  });
});
