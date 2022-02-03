import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { toggleDisplay } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-if";
import { otIf } from "../../src/directives/ot-if";

describe("ot-if", () => {
  let body, elem, page;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  describe("var", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var"></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent('ot.reset');
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'var'", async () => {
      toggleDisplay(elem, true);
      page.reset(["var"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'othervar'", async () => {
      toggleDisplay(elem, true);
      page.reset(["othervar"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("toggles", async () => {
      toggleDisplay(elem, false);

      page.update({ var: true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ var: false });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

  });

  describe("obj.fld", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent('ot.reset');
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'otherobj'", async () => {
      toggleDisplay(elem, true);

      page.reset(["otherobj"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("resets with 'obj.fld'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj.fld"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'obj.otherfld'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj.otherfld"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("toggles by obj", async () => {
      toggleDisplay(elem, false);

      page.update({ obj: { fld: true } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ obj: { fld: false } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj.fld", async () => {
      toggleDisplay(elem, false);

      page.update({ "obj.fld": true });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ "obj.fld": false });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by missing fld", async () => {
      toggleDisplay(elem, true);

      page.update({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var == val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var == 'foo'"></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent('ot.reset');
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'var'", async () => {
      toggleDisplay(elem, true);

      page.reset(["var"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'othervar'", async () => {
      toggleDisplay(elem, true);

      page.reset(["othervar"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("toggles", async () => {
      toggleDisplay(elem, false);

      page.update({ var: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ var: "bar" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("obj.fld == val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="obj.fld == 'foo'"></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent('ot.reset');
    });

    it("resets", async () => {
      toggleDisplay(elem, true);

      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("resets with 'obj'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'otherobj'", async () => {
      toggleDisplay(elem, true);

      page.reset(["otherobj"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("resets with 'obj.fld'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj.fld"]);
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("not resets with 'obj.otherfld'", async () => {
      toggleDisplay(elem, true);

      page.reset(["obj.otherfld"]);
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("toggles by obj", async () => {
      toggleDisplay(elem, false);

      page.update({ obj: { fld: "foo" } });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ obj: { fld: "bar" } });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by obj.fld", async () => {
      toggleDisplay(elem, false);

      page.update({ "obj.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.update({ "obj.fld": "var" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("toggles by missing fld", async () => {
      toggleDisplay(elem, true);

      page.update({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
