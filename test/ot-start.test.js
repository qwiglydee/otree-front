import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { Page } from "../src/page";

const EVENT_DEFAULTS = {
    view: window,
    bubbles: true,
    cancelable: true,
  };


describe("ot-input", () => {
  let body, page, elem;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(
        `<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-start></div>`,
        { parentNode: body });
    page = new Page(body);
    page.init();
  });

  it("triggers on key", async () => {
    page.root.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
    await oneEvent(page.root, "ot.start");
  });

  it("triggers on touch", async () => {
    elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
    await oneEvent(page.root, "ot.start");
  });

  it("triggers on touch", async () => {
    elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
    await oneEvent(page.root, "ot.start");
  });

  it("disables on start", async () => {
    page.start();
    await elementUpdated(elem);
    expect(elem.disabled).to.be.true;
  });

  it("doesn't trigger disabled");
});
