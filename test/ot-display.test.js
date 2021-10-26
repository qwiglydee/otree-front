import { expect, fixture, elementUpdated, aTimeout } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-display errors", () => {
  let elem, page;

  it("raise for missing phase", async () => {
    debugger;
    elem = await fixture(`<div data-ot-display=""></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });
});

describe("ot-display", () => {
  let body, elem, page;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div data-ot-display="foo"></div>`, {
      parentNode: body,
    });
    page = new Page(body);
    page.init();
  });

  it("hides on reset", async () => {
    page.reset();
    await elementUpdated(elem);
    expect(elem).not.to.be.displayed;
  });

  it("displays on phase", async () => {
    page.reset();
    page.display('foo');
    await elementUpdated(elem);
    expect(elem).to.be.displayed;
  });

  it("not displays on misphase", async () => {
    page.reset();
    page.display('bas');
    await elementUpdated(elem);
    expect(elem).not.to.be.displayed;
  });
});
