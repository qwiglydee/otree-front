import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { toggleDisplay } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-when";

describe("ot-when", () => {
  let body, elem, page;

  describe("var", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by false-like values", async () => {
      page.emitUpdate({ "game.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": true });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: true } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var==number", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld==42"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": 42 });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by str-eq", async () => {
      page.emitUpdate({ "game.fld": "42" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": 42 });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: 42 } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var===number", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld===42"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": 42 });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("doesn't switches on by str-eq", async () => {
      page.emitUpdate({ "game.fld": "42" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": 42 });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: 42 } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var==bool", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld==false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches on by str-eq", async () => {
      page.emitUpdate({ "game.fld": "" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": false });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: false } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var===bool", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld===false"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": false });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("doesnt switch on by str-eq", async () => {
      page.emitUpdate({ "game.fld": "" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": false });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: false } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("var=='str'", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-when="game.fld=='foo'"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      toggleDisplay(elem, true);
      page.emitReset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches on", async () => {
      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;
    });

    it("switches off by undef", async () => {
      page.emitUpdate({ "game.fld": "foo" });
      await elementUpdated(elem);

      page.emitUpdate({ "game.fld": undefined });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches off by missing", async () => {
      page.emitUpdate({ game: { fld: "foo" } });
      await elementUpdated(elem);

      page.emitUpdate({ game: {} });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
