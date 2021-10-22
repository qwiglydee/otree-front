import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { Page } from "../src/page";

describe("ot-img errors", () => {
  let body, elem, page;

  it("raise for invalid path", async () => {
    elem = await fixture(`<div data-ot-img=".foo"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });

  it("raise for invalid chars", async () => {
    elem = await fixture(`<div data-ot-img="foo/bar"></div>`);
    page = new Page();
    expect(() => page.init()).to.throw();
  });

  it("raise for invalid img value on reset");
});

describe("ot-img", () => {
  let body, elem, page;
  const img = new Image();
  img.alt = "the_image";

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div data-ot-img="foo"></div>`, { parentNode: body });
    page = new Page(body);
    page.init();
  });

  it("resets to empty for unset var", async () => {
    page.reset();
    await elementUpdated(elem);
    expect(elem).to.be.empty;
  });

  it("resets to img", async () => {
    page.reset({ foo: img });
    await elementUpdated(elem);
    expect(elem).to.contain("img[alt='the_image']");
  });

  it("changes to empty for unset var", async () => {
    page.reset({ foo: img });
    await elementUpdated(elem);
    page.update({ foo: undefined });
    await elementUpdated(elem);
    expect(elem).to.be.empty;
  });

  it("changes to img", async () => {
    page.reset();
    await elementUpdated(elem);
    page.update({ foo: img });
    await elementUpdated(elem);
    expect(elem).to.contain("img[alt='the_image']");
  });
});
