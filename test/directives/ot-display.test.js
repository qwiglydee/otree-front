import { expect, fixture, elementUpdated, aTimeout } from "@open-wc/testing";

import { Page } from "../../src/page";

import "../../src/directives/ot-display";

describe("ot-display", () => {
  let body, elem, page;

  describe("switching", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-display="foo"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("switches", async () => {
      page.emitEvent('ot.phase', { display: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitEvent('ot.phase', { display: "bar" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });

  describe("switching conjunction", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-display="foo|bar"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("switches", async () => {
      page.emitEvent('ot.phase', { display: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitEvent('ot.phase', { display: "bar" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.emitEvent('ot.phase', { display: "baz" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
