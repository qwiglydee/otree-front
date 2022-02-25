import { expect, fixture, nextFrame, oneEvent } from "@open-wc/testing";

import { setText } from "../../src/utils/dom";
import { Page } from "../../src/page";

import { otText } from "../../src/directives/ot-text";

describe("ot-text", () => {
  let body, elem, page;

  describe("errors", () => {
    beforeEach(async () => {
      body = document.createElement("body");
    });

    it("on empty", async () => {
      await fixture(`<div ot-text=""></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on bogus expr", async () => {
      await fixture(`<div ot-text="13"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on wrong inp expr", async () => {
      await fixture(`<div ot-text="foo = true"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });

    it("on wrong cmp expr", async () => {
      await fixture(`<div ot-text="foo == true"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });
  });

  describe("resetting", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-text="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      setText(elem, "initial");
    });

    it("resets globally", async () => {
      page.reset();
      await nextFrame();
      expect(elem).to.have.text("");
    });

    it("resets by specific var", async () => {
      page.reset(["var"]);
      await nextFrame();
      expect(elem).to.have.text("");
    });

    it("not resets by irrelevant var", async () => {
      page.reset(["anothervar"]);
      await nextFrame();
      expect(elem).to.have.text("initial");
    });
  });

  describe("changing", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-text="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      setText(elem, "initial");
    });

    it("by updaing var", async () => {
      page.update({ var: "foo" });
      await nextFrame();
      expect(elem).to.have.text("foo");
    });

    it("not by updating another var", async () => {
      page.update({ anothervar: "foo" });
      await nextFrame();
      expect(elem).to.have.text("initial");
    });

    it("by inputting var", async () => {
      page.input("var", "foo");
      await nextFrame();
      expect(elem).to.have.text("foo");
    });

    it("not by inputting another var", async () => {
      page.input("anothervar", "foo");
      await nextFrame();
      expect(elem).to.have.text("initial");
    });
  });
});
