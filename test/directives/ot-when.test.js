import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { toggleDisplay } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-when";

describe("ot-when", () => {
  let body, elem, page;

  describe("var", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by false-like values", async () => {
      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": true });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: true } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var==number", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld==42"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": 42 });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by str-eq", async () => {
      page.emitUpdate({ "obj.fld": "42" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": 42 });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: 42 } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var===number", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld===42"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": 42 });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("doesn't switches on by str-eq", async () => {
      page.emitUpdate({ "obj.fld": "42" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": 42 });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: 42 } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var==bool", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld==false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by str-eq", async () => {
      page.emitUpdate({ "obj.fld": "" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: false } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var===bool", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld===false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("doesnt switch on by str-eq", async () => {
      page.emitUpdate({ "obj.fld": "" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": false });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: false } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var=='str'", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="obj.fld=='foo'"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset("obj");
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "obj.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "obj.fld": "foo" });
      await elementUpdated(elem);

      page.emitUpdate({ "obj.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ obj: { fld: "foo" } });
      await elementUpdated(elem);

      page.emitUpdate({ obj: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

});
