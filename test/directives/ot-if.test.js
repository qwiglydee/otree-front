import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { toggleDisplay } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-if";
import { otIf } from "../../src/directives/ot-if";

describe("ot-if", () => {
  let body, elem, page;
  describe('="var"', () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'var'", async () => {
      toggleDisplay(elem, true);
      page.emitReset(["var"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ var: true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ var: false });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

  });

  describe('="obj.fld"', () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj'", async () => {
      toggleDisplay(elem, true);

      page.emitReset(["obj"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj.fld'", async () => {
      toggleDisplay(elem, true);

      page.emitReset(["obj.fld"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ obj: { fld: true } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ obj: { fld: false } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj.fld", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ "obj.fld": true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by missing fld", async () => {
      toggleDisplay(elem, true);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe('="var == val"', () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var == 'foo'"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'var'", async () => {
      toggleDisplay(elem, true);

      page.emitReset(["var"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ var: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ var: "bar" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe('="obj.fld == val"', () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="obj.fld == 'foo'"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj'", async () => {
      toggleDisplay(elem, true);

      page.emitReset(["obj"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj.fld'", async () => {
      toggleDisplay(elem, true);

      page.emitReset(["obj.fld"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj.fld", async () => {
      toggleDisplay(elem, false);

      page.emitUpdate({ "obj.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitUpdate({ "obj.fld": "var" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by missing fld", async () => {
      toggleDisplay(elem, true);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
