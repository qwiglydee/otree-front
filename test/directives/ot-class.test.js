import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { setClasses } from "../../src/utils/dom";
import { Page } from "../../src/page";
import "../../src/directives/ot-class";


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
      elem = await fixture(`<div class="cls1 cls2" data-ot-class="game.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      setClasses(elem, ['cls1', 'foo', 'bar'])
      page.emitReset();
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("changes by fld", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ "game.fld": "bar" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("changes by obj", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ game: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ game: { fld: "bar" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "bar"]);
    });

    it("ignores unrelated fld", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ "game.fld2": "bar" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });

    it("ignores unrelated obj", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ game: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ obj2: { fld: "bar" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);
    });

    it("clears by fld deletion", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("clears by empty obj", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ game: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });

    it("clears by obj deletion", async () => {
      page.emitReset();
      await elementUpdated(elem);

      page.emitUpdate({ game: { fld: "foo" } });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2", "foo"]);

      page.emitUpdate({ game: undefined });
      await elementUpdated(elem);
      expect([...elem.classList]).to.eql(["cls1", "cls2"]);
    });
  });
});
