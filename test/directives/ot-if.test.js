import { expect, fixture, oneEvent, nextFrame } from "@open-wc/testing";

import { toggleDisplay } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-if";

describe("ot-if", () => {
  let body, elem, page;

  describe("errors", () => {
    beforeEach(async () => {
      body = document.createElement("body");
    });

    it("on empty", async () => {
      await fixture(`<div ot-if=""></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on bogus expr", async () => {
      await fixture(`<div ot-if="13"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on wrong inp expr", async () => {
      await fixture(`<div ot-if="foo = true"></div>`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference or condition");
    });
  });

  describe("var", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
    });

    describe("resetting", () => {
      it("globally", async () => {
        toggleDisplay(elem, true);
        page.reset();
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("by specific var", async () => {
        toggleDisplay(elem, true);
        page.reset(["var"]);
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("not by irrelevant var", async () => {
        toggleDisplay(elem, true);
        page.reset(["anothervar"]);
        await nextFrame();
        expect(elem).to.be.displayed;
      });
    });

    describe("changing", () => {
      it("by updaing var to str", async () => {
        toggleDisplay(elem, false);
        page.update({ var: "foo" });
        await nextFrame();
        expect(elem).to.be.displayed;
      });

      it("not by updaing unrelated var", async () => {
        toggleDisplay(elem, false);
        page.update({ anothervar: "foo" });
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("by updaing var to true", async () => {
        toggleDisplay(elem, false);
        page.update({ var: true });
        await nextFrame();
        expect(elem).to.be.displayed;
      });

      it("by updaing var to false", async () => {
        toggleDisplay(elem, true);
        page.update({ var: false });
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("by inputting var", async () => {
        toggleDisplay(elem, false);
        page.input("var", "foo");
        await nextFrame();
        expect(elem).to.be.displayed;
      });

      it("not by inputting unrelated var", async () => {
        toggleDisplay(elem, false);
        page.input("anothervar", "foo");
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });
    });
  });

  describe("var == val", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div ot-if="var == 'val'"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
    });

    describe("resetting", () => {
      it("globally", async () => {
        toggleDisplay(elem, true);
        page.reset();
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("by specific var", async () => {
        toggleDisplay(elem, true);
        page.reset(["var"]);
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("not by irrelevant var", async () => {
        toggleDisplay(elem, true);
        page.reset(["anothervar"]);
        await nextFrame();
        expect(elem).to.be.displayed;
      });
    });

    describe("changing", () => {
      it("by updaing var to match", async () => {
        toggleDisplay(elem, false);
        page.update({ var: "val" });
        await nextFrame();
        expect(elem).to.be.displayed;
      });

      it("by updaing var to mismatch", async () => {
        toggleDisplay(elem, true);
        page.update({ var: "xxx" });
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("not by updaing unrelated var", async () => {
        toggleDisplay(elem, false);
        page.update({ anothervar: "val" });
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });

      it("by inputting var", async () => {
        toggleDisplay(elem, false);
        page.input("var", "val");
        await nextFrame();
        expect(elem).to.be.displayed;
      });

      it("not by inputting unrelated var", async () => {
        toggleDisplay(elem, false);
        page.input("anothervar", "val");
        await nextFrame();
        expect(elem).not.to.be.displayed;
      });
    });
  });
});
