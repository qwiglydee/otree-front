import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { Page } from "../src/page";

const EVENT_DEFAULTS = {
  view: window,
  bubbles: true,
  cancelable: true,
};

describe("ot-input", () => {
  let page, body, elem, detail;

  describe("errors", () => {
    it("invalid path", async () => {
      elem = await fixture(`<input data-ot-input=".foo"></div>`, { parentNode: body });
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid chars", async () => {
      elem = await fixture(`<input data-ot-input="foo/bar"></div>`, { parentNode: body });
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid expr for inputs", async () => {
      elem = await fixture(`<input data-ot-input="foo=bar"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid expr for button", async () => {
      elem = await fixture(`<button data-ot-input="foo"></button>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("invalid expr for custom", async () => {
      elem = await fixture(`<div data-ot-click data-ot-input="foo"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });

    it("missing trigger", async () => {
      elem = await fixture(`<div data-ot-input="foo=val"></div>`);
      expect(() => new Page(document.body)).to.throw();
    });
  });

  describe("input", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<input type="text" data-ot-input="fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggleInput(true);
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("disabled");
      expect(elem).not.to.have.class("ot-disabled");

      page.toggleInput(false);
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on change", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.value = "123";
      elem.dispatchEvent(new InputEvent("change"));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "123" });
      await oneEvent(page.root, "ot.update");
    });

    it("triggers on 'Enter'", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.value = "123";
      elem.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Enter" }));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "123" });
      await oneEvent(page.root, "ot.update");
    });
  });

  describe("input nested field", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<input type="text" data-ot-input="obj.sub.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("triggers on change", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.value = "123";
      elem.dispatchEvent(new InputEvent("change"));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, obj: { sub: { fld: "123" } } });
      await oneEvent(page.root, "ot.update") ;
    });
  });

  describe("button", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<button data-ot-input="fld=foo"></button>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggleInput(true);
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("disabled");
      expect(elem).not.to.have.class("ot-disabled");

      page.toggleInput(false);
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on click", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "foo" });
      await oneEvent(page.root, "ot.update");
    });
  });

  describe("custom", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-input="fld=foo"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggleInput(true);
      await elementUpdated(elem);
      expect(elem).not.to.have.class("ot-disabled");

      page.toggleInput(false);
      await elementUpdated(elem);
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on key", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      page.root.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "foo" });
      await oneEvent(page.root, "ot.update");
    });

    it("triggers on touch", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "foo" });
      await oneEvent(page.root, "ot.update");
    });

    it("triggers on click", async () => {
      page.toggleInput(true);
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = (await oneEvent(page.root, "ot.response")).detail;
      expect(detail).to.deep.eq({ page, fld: "foo" });
      await oneEvent(page.root, "ot.update");
    });

    it("errors frozen on key", async () => {
      page.toggleInput(false);
      await elementUpdated(elem);
      page.root.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
      detail = (await oneEvent(page.root, "ot.error")).detail;
      expect(detail).to.deep.eq({ page, error: "frozen" });
      await oneEvent(page.root, "ot.update");
    });

    it("errors frozen on touch", async () => {
      page.toggleInput(false);
      await elementUpdated(elem);
      elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
      detail = (await oneEvent(page.root, "ot.error")).detail;
      expect(detail).to.deep.eq({ page, error: "frozen" });
      await oneEvent(page.root, "ot.update");
    });

    it("errors frozen on click", async () => {
      page.toggleInput(false);
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = (await oneEvent(page.root, "ot.error")).detail;
      expect(detail).to.deep.eq({ page, error: "frozen" });
      await oneEvent(page.root, "ot.update");
    });
  });
});
