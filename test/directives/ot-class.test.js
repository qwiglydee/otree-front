import { expect, fixture, oneEvent, nextFrame } from "@open-wc/testing";

import { Page } from "../../src/page";
import "../../src/directives/ot-class";


describe("ot-class", () => {
  let body, elem, page;

  describe("errors", () => {
    beforeEach(async () => {
      body = document.createElement("body");
    });

    it("on empty", async () => {
      await fixture(`<div ot-class=""></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on bogus expr", async () => {
      await fixture(`<div ot-class="13"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on wrong inp expr", async () => {
      await fixture(`<div ot-class="foo = true"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });

    it("on wrong cmp expr", async () => {
      await fixture(`<div ot-class="foo == true"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });
  });

  describe("resetting", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div class="default" ot-class="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      elem.classList.add("initial");
    });

    it("resets globally", async () => {
      page.reset();
      await nextFrame();
      expect([...elem.classList]).to.eql(['default']);
    });

    it("resets by specific var", async () => {
      page.reset(["var"]);
      await nextFrame();
      expect([...elem.classList]).to.eql(['default']);
    });

    it("not resets by irrelevant var", async () => {
      page.reset(["anothervar"]);
      await nextFrame();
      expect([...elem.classList]).to.eql(['default', 'initial']);
    });
  });


  describe("changing", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div class="default" ot-class="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
      elem.classList.add("initial");
    });

    it("by updaing var", async () => {
      page.update({ var: "foo" });
      await nextFrame();
      expect([...elem.classList]).to.eql(['default', 'foo']);
    });

    it("not by updating another var", async () => {
      page.update({ anothervar: "foo" });
      await nextFrame();
      expect([...elem.classList]).to.eql(['default', 'initial']);
    });

    it("by inputting var", async () => {
      page.input("var", "foo");
      await nextFrame();
      expect([...elem.classList]).to.eql(['default', 'foo']);
    });

    it("not by inputting another var", async () => {
      page.input("anothervar", "foo");
      await nextFrame();
      expect([...elem.classList]).to.eql(['default', 'initial']);
    });
  });

});
