import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Ref, Changes } from "../../src/utils/changes";

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
      elem = await fixture(`<input type="text" data-ot-input="obj.fld"></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches on phase", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggle({input: true});
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("disabled");
      expect(elem).not.to.have.class("ot-disabled");

      page.toggle({input: false});
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on change", async () => {
      page.toggle({input: true});
      await elementUpdated(elem);

      elem.value = "Foo";
      elem.dispatchEvent(new InputEvent("change"));

      detail = await pageEvent("otree.response");
      expect(detail).to.eql(new Changes({ "obj.fld": "Foo" }));
    });

    it("triggers on enter");
  });

  describe("button", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<button data-ot-input="obj.fld=foo"></button>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches on phase", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggle({input: true});
      await elementUpdated(elem);
      expect(elem).not.to.have.attr("disabled");
      expect(elem).not.to.have.class("ot-disabled");

      page.toggle({input: false});
      await elementUpdated(elem);
      expect(elem).to.have.attr("disabled");
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on click", async () => {
      page.toggle({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = await pageEvent("otree.response");
      expect(detail).to.eql(new Changes({ "obj.fld": "foo" }));
    });
  });

  describe("custom", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-input="obj.fld=foo"></div>`, {
        parentNode: body,
      });
      page = new Page(body);
    });

    it("resets", async () => {
      page.reset();
      await elementUpdated(elem);
      expect(elem).to.have.class("ot-disabled");
    });

    it("switches on phase", async () => {
      page.reset();
      await elementUpdated(elem);

      page.toggle({input: true});
      await elementUpdated(elem);
      expect(elem).not.to.have.class("ot-disabled");

      page.toggle({input: false});
      await elementUpdated(elem);
      expect(elem).to.have.class("ot-disabled");
    });

    it("triggers on key", async () => {
      page.toggle({input: true});
      await elementUpdated(elem);
      page.body.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
      detail = await pageEvent("otree.response");
      expect(detail).to.eql(new Changes({ "obj.fld": "foo" }));
    });

    it("triggers on touch", async () => {
      page.toggle({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
      detail = await pageEvent("otree.response");
      expect(detail).to.eql(new Changes({ "obj.fld": "foo" }));
    });

    it("triggers on click", async () => {
      page.toggle({input: true});
      await elementUpdated(elem);
      elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
      detail = await pageEvent("otree.response");
      expect(detail).to.eql(new Changes({ "obj.fld": "foo" }));
    });

    it("errors frozen on key");
    it("errors frozen on touch");
    it("errors frozen on click");
  });
});
