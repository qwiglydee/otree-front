import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { Page } from "../../src/page";

import "../../src/directives/ot-input";


const EVENT_DEFAULTS = {
  view: window,
  bubbles: true,
  cancelable: true,
};

describe("ot-input", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function elemEvent(type) {
    return (await oneEvent(elem, type)).detail;
  }

  describe("text input", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<input type="text" data-ot-input name="foo"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("clears on reset", async () => {
      elem.value="xxx";

      page.emitReset();
      await elementUpdated(elem);

      expect(elem.value).to.eq("");
    });

    it("switches on phase", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      expect(elem.disabled).to.be.false;
      expect(elem).not.to.have.class("ot-disabled");

      page.togglePhase({input: false});
      await elementUpdated(elem);
      expect(elem.disabled).to.be.true;
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on change", async () => {
      page.resetPhase({ input: true});
      await elementUpdated(elem);

      elem.value = "Foo";
      elem.dispatchEvent(new InputEvent("change"));

      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });

    it("triggers on enter", async () => {
      page.resetPhase({ input: true});
      await elementUpdated(elem);

      elem.value = "Foo";
      elem.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter"}));

      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });
  });

  describe("text input no name", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<input type="text" data-ot-input></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("triggers on change", async () => {
      page.resetPhase({ input: true});
      await elementUpdated(elem);

      elem.value = "Foo";
      elem.dispatchEvent(new InputEvent("change"));

      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name:"", value: "Foo" });
    });

  })


  describe("button", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<button data-ot-input name="foo" value="Foo"></button>`, { parentNode: body });
      page = new Page(body);
    });

    it("switches on phase", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("disabled");
      expect(elem).not.to.have.class("ot-disabled");

      page.togglePhase({input: false});
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on click", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });
  });

  describe("custom", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-input  name="foo" value="Foo"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("switches on phase", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      expect(elem).not.to.have.class("ot-disabled");

      page.togglePhase({input: false});
      await elementUpdated(elem);
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on key", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      page.body.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });

    it("triggers on touch", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });

    it("triggers on click", async () => {
      page.togglePhase({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });
  });
});
