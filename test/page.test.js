import { expect, fixture, oneEvent } from "@open-wc/testing";

import { Page } from "../src/page";

describe("Page controller", () => {
  let body, elem, page;

  describe("initializes", () => {
    it("with given root elem", async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`);
      page = new Page(body);
      expect(page.root).to.equal(body);
    });

    it("with document body", async () => {
      body = document.body;
      page = new Page();
      expect(page.root).to.equal(body);
    });

    it("with empty initial state", async () => {
      page = new Page();
      expect(page.state).to.deep.equal({});
    });
  });
});

describe("Page controller", () => {
  let body, elem, page, detail;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div></div>`, { parentNode: body });
    page = new Page(body);
    detail = null;
  });

  it("starts", async () => {
    page.start();
    detail = (await oneEvent(body, "ot.start")).detail;
    expect(detail).to.deep.equal({ page: page });
  });

  it("resets", async () => {
    page.reset();
    expect(page.state).to.deep.equal({});
    detail = (await oneEvent(body, "ot.reset")).detail;
    expect(detail).to.deep.equal({ page: page });
  });

  it("updates empty", async () => {
    page.update({ foo: "Foo1", bar: "Bar1" });
    expect(page.state).to.deep.equal({ foo: "Foo1", bar: "Bar1" });
    detail = (await oneEvent(body, "ot.update")).detail;
    expect(detail).to.deep.equal({ page: page, changes: { foo: "Foo1", bar: "Bar1" } });
  });

  it("updates existing", async () => {
    page.state = { foo: "Foo1", bar: "Bar1" };
    page.update({ bar: "Bar2", baz: "Baz2" });
    expect(page.state).to.deep.equal({ foo: "Foo1", bar: "Bar2", baz: "Baz2" });
    detail = (await oneEvent(body, "ot.update")).detail;
    expect(detail).to.deep.equal({ page: page, changes: { bar: "Bar2", baz: "Baz2" } });
  });

  it("displays", async () => {
    page.display();
    detail = (await oneEvent(body, "ot.display")).detail;
    expect(detail).to.deep.equal({ page: page });
  });

  it("freezes", async () => {
    page.freeze();
    detail = (await oneEvent(body, "ot.freeze")).detail;
    expect(detail).to.deep.equal({ page: page, frozen: true });
  });

  it("unfreezes", async () => {
    page.unfreeze();
    detail = (await oneEvent(body, "ot.freeze")).detail;
    expect(detail).to.deep.equal({ page: page, frozen: false });
  });
});
