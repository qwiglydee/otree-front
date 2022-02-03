import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { setAttr } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-attr";

describe("ot-attr", () => {
  let body, elem, page;

  describe("errors", () => {
    let elem;

    it("invalid path", async () => {
      elem = await fixture(`<div ot-value=".foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<div ot-value="foo/bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("updating", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(
        `<progress ot-value="game.val" ot-max="game.max"></progress>`,
        {
          parentNode: body,
        }
      );
      page = new Page(body);
    });

    it("resets", async () => {
      setAttr(elem, "max", "100");
      setAttr(elem, "value", "1");
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("max");
      expect(elem).not.to.have.attr("value");
    });

    it("changes by fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ "game.val": 50, "game.max": 100 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ "game.val": 75 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "75");
    });

    it("changes by obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ game: { val: 75, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "75");
    });

    it("ignores unrelated fld", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ "game.xxx": 150 });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");
    });

    it("ignores unrelated obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ objX: { val: 75, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");
    });

    it("clears by fld deletion", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ "game.val": undefined });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).not.to.have.attr("value");
    });

    it("clears by empty obj", async () => {
      page.reset();
      await elementUpdated(elem);

      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("max");
      expect(elem).not.to.have.attr("value");
    });

    it("clears by obj deletion", async () => {
      page.update({ game: { val: 50, max: 100 } });
      await elementUpdated(elem);
      expect(elem).to.have.attr("max", "100");
      expect(elem).to.have.attr("value", "50");

      page.update({ game: undefined });
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("max");
      expect(elem).not.to.have.attr("value");
    });
  });
});
