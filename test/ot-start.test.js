import { expect, fixture, elementUpdated, oneEvent } from "@open-wc/testing";

import { Page } from "../src/page";

const EVENT_DEFAULTS = {
    view: window,
    bubbles: true,
    cancelable: true,
  };


describe("ot-start", () => {
  let body, page, elem;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(
        `<div data-ot-click data-ot-touch data-ot-key="Space" data-ot-start></div>`,
        { parentNode: body });
    page = new Page(body);
  });

  it("triggers on key", async () => {
    page.body.dispatchEvent(new KeyboardEvent("keydown", { ...EVENT_DEFAULTS, code: "Space" }));
    await oneEvent(page.body, "ot.start");
    expect(elem).not.to.be.displayed;
  });

  it("triggers on touch", async () => {
    elem.dispatchEvent(new TouchEvent("touchend", EVENT_DEFAULTS));
    await oneEvent(page.body, "ot.start");
    expect(elem).not.to.be.displayed;
  });

  it("triggers on touch", async () => {
    elem.dispatchEvent(new MouseEvent("click", EVENT_DEFAULTS));
    await oneEvent(page.body, "ot.start");
    expect(elem).not.to.be.displayed;
  });

  it("doesn't trigger disabled");
});
