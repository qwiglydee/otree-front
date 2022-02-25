import { expect, fixture, nextFrame, oneEvent } from "@open-wc/testing";

import { setAttr } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-attr";

describe("ot-attr", () => {
  let body, elem, page;

  describe("errors", () => {
    beforeEach(async () => {
      body = document.createElement("body");
    });

    it("on empty", async () => {
      await fixture(`<progress ot-value=""></progress>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on bogus expr", async () => {
      await fixture(`<progress ot-value="13"></progress>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on wrong inp expr", async () => {
      await fixture(`<progress ot-value="foo = true"></progress>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });

    it("on wrong cmp expr", async () => {
      await fixture(`<progress ot-value="foo == true"></progress>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });
  });

  describe("resetting", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<progress ot-value="var"></progress>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      elem.setAttribute("value", "100");
    });

    it("resets globally", async () => {
      page.reset();
      await nextFrame();
      expect(elem).to.not.have.attribute("value");
    });

    it("resets by specific var", async () => {
      page.reset(["var"]);
      await nextFrame();
      expect(elem).to.not.have.attribute("value");
    });

    it("not resets by irrelevant var", async () => {
      page.reset(["anothervar"]);
      await nextFrame();
      expect(elem).to.have.attribute("value", "100");
    });
  });

  describe("changing", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<progress ot-value="var"></progress>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      elem.setAttribute("value", "initial");
    });

    it("by updaing var", async () => {
      page.update({ var: "foo" });
      await nextFrame();
      expect(elem).to.have.attribute("value", "foo");
    });

    it("not by updating another var", async () => {
      page.update({ anothervar: "foo" });
      await nextFrame();
      expect(elem).to.have.attribute("value", "initial");
    });

    it("by inputting var", async () => {
      page.input("var", "foo");
      await nextFrame();
      expect(elem).to.have.attribute("value", "foo");
    });

    it("not by inputting another var", async () => {
      page.input("anothervar", "foo");
      await nextFrame();
      expect(elem).to.have.attribute("value", "initial");
    });
  });
});
