import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";
import { toggleDisabled } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-input";

const EVENT_DEFAULTS = {
  view: window,
  bubbles: true,
  cancelable: true,
};

describe("ot-enabled", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  describe("native ot-input", () => {
    describe("without ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<input type="text" ot-input="foo"></div>`, { parentNode: body });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("enabled on reset", async () => {
        toggleDisabled(elem, true);

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.match(":disabled");
      });

      it("freezes", async () => {
        toggleDisabled(elem, false);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.match(":disabled");
      });

      it("unfreezes", async () => {
        toggleDisabled(elem, true);

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.match(":disabled");
      });

      it("unfreezes on reset", async () => {
        toggleDisabled(elem, true);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.match(":disabled");

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.match(":disabled");
      });
    });

    describe("with ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<input type="text" ot-input="foo" ot-enabled="phase == 'input'"></div>`, {
          parentNode: body,
        });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("disabled on reset", async () => {
        page.reset();
        await pageEvent("ot.reset");

        expect(elem).to.match(":disabled");
      });

      it("toggles on update", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.match(":disabled");

        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.match(":disabled");
      });

      it("ignores nonrelevant reset", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.match(":disabled");

        page.reset(["xxx"]);
        await pageEvent("ot.reset");

        expect(elem).not.to.match(":disabled");
      });

      it("freezes/unfreezes when enabled", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.match(":disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.match(":disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.match(":disabled");
      });

      it("freezes/unfreezes when disabled", async () => {
        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.match(":disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.match(":disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.match(":disabled");
      });
    });
  });

  describe("custom ot-input", () => {
    describe("without ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<div ot-click ot-input="foo = 'Foo'"></div>`, { parentNode: body });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("enabled on reset", async () => {
        toggleDisabled(elem, true);

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes", async () => {
        toggleDisabled(elem, false);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");
      });

      it("unfreezes", async () => {
        toggleDisabled(elem, true);

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("unfreezes on reset", async () => {
        toggleDisabled(elem, true);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });
    });

    describe("with ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<div ot-click ot-input="foo = 'Foo'" ot-enabled="phase == 'input'"></div>`, {
          parentNode: body,
        });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("disabled on reset", async () => {
        page.reset();
        await pageEvent("ot.reset");

        expect(elem).to.have.class("ot-disabled");
      });

      it("toggles on update", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.have.class("ot-disabled");
      });

      it("ignores nonrelevant reset", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.reset(["xxx"]);
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes/unfreezes when enabled", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes/unfreezes when disabled", async () => {
        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.have.class("ot-disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");
      });
    });
  });

  describe("custom ot-emit", () => {
    describe("without ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<div ot-emit="foo'"></div>`, { parentNode: body });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("enabled on reset", async () => {
        toggleDisabled(elem, true);

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes", async () => {
        toggleDisabled(elem, false);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");
      });

      it("unfreezes", async () => {
        toggleDisabled(elem, true);

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("unfreezes on reset", async () => {
        toggleDisabled(elem, true);

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.reset();
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });
    });

    describe("with ot-enabled", () => {
      beforeEach(async () => {
        body = document.createElement("body");
        elem = await fixture(`<div ot-emit="foo" ot-enabled="phase == 'input'"></div>`, {
          parentNode: body,
        });
        page = new Page(body);
        await pageEvent("ot.reset");
      });

      it("disabled on reset", async () => {
        page.reset();
        await pageEvent("ot.reset");

        expect(elem).to.have.class("ot-disabled");
      });

      it("toggles on update", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.have.class("ot-disabled");
      });

      it("ignores nonrelevant reset", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.reset(["xxx"]);
        await pageEvent("ot.reset");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes/unfreezes when enabled", async () => {
        page.update({ phase: "input" });
        await pageEvent("ot.update");

        expect(elem).not.to.have.class("ot-disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).not.to.have.class("ot-disabled");
      });

      it("freezes/unfreezes when disabled", async () => {
        page.update({ phase: "noinput" });
        await pageEvent("ot.update");

        expect(elem).to.have.class("ot-disabled");

        page.freezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");

        page.unfreezeInputs();
        await pageEvent("ot.freezing");

        expect(elem).to.have.class("ot-disabled");
      });
    });
  });
});

describe("native ot-input", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<input type="text" ot-input="foo"></div>`, { parentNode: body });
    page = new Page(body);
  });

  it("resets", async () => {
    elem.value = "xxx";

    page.reset();
    await elementUpdated(elem);

    expect(elem.value).to.eq("");
  });

  it("updates", async () => {
    elem.value = "xxx";

    page.update({ foo: "Foo" });
    await elementUpdated(elem);

    expect(elem.value).to.eq("Foo");
  });

  it("doesn't trigger on change"); // FIXME

  it("triggers on enter", async () => {
    await elementUpdated(elem);

    elem.value = "Foo";
    elem.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));

    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ name: "foo", value: "Foo" });
  });
});

describe("button ot-input", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<button ot-input="foo = 'Foo'"></button>`, {
      parentNode: body,
    });
    page = new Page(body);
  });

  it("triggers on click", async () => {
    await elementUpdated(elem);
    elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ name: "foo", value: "Foo" });
  });
});

describe("custom ot-input", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div ot-click ot-touch ot-key="Space" ot-input="foo = 'Foo'"></div>`, {
      parentNode: body,
    });
    page = new Page(body);
  });

  it("triggers on key", async () => {
    await elementUpdated(elem);
    page.body.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ name: "foo", value: "Foo" });
  });

  it("triggers on touch", async () => {
    await elementUpdated(elem);
    elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ name: "foo", value: "Foo" });
  });

  it("triggers on click", async () => {
    await elementUpdated(elem);
    elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ name: "foo", value: "Foo" });
  });
});

describe("ot-emit", () => {
  let page, body, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div ot-click ot-touch ot-key="Space" ot-emit="foo"></div>`, {
      parentNode: body,
    });
    page = new Page(body);
  });

  it("triggers on key", async () => {
    await elementUpdated(elem);
    page.body.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
    detail = await pageEvent("foo");
  });

  it("triggers on touch", async () => {
    await elementUpdated(elem);
    elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
    detail = await pageEvent("foo");
  });

  it("triggers on click", async () => {
    await elementUpdated(elem);
    elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
    detail = await pageEvent("foo");
  });
});
