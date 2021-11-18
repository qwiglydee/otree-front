import { expect, fixture, elementUpdated, aTimeout } from "@open-wc/testing";

import { Page } from "../../src/page";

describe("ot-display", () => {
  let body, elem, page;

  describe("errors", () => {
    it("missing phase", async () => {
      elem = await fixture(`<div data-ot-display=""></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("switching", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-display="foo"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggle({ display: "foo" });
      await elementUpdated(elem);
      expect(elem).to.be.displayed;

      page.toggle({ display: "bar" });
      await elementUpdated(elem);
      expect(elem).not.to.be.displayed;
    });
  });
});
