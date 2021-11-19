import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

describe("Page controller", () => {
  let body, page, elem, detail;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div></div>`, { parentNode: body });
    page = new Page(body);
  });

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  it("resets", async () => {
    page.reset();
    detail = await pageEvent('otree.reset');
    expect(detail).to.be.null;
    expect(page.phase).to.eql({});
  });

  it("fires random event", async () => {
    page.fire("foo", { bar: "Bar" });
    detail = await pageEvent('foo');
    expect(detail).to.eql({ bar: "Bar" });
  });

  it("fires start", async () => {
    page.start();
    detail = await pageEvent("otree.start");
    expect(detail).to.be.null;
  });

  it("fires update", async () => {
    page.update({ foo: "Foo" });
    detail = await pageEvent("otree.update");
    expect(detail).to.eql(new Changes({ foo: "Foo"}));
  });

  it("fires response", async () => {
    page.response({ foo: "Foo" });
    detail = await pageEvent("otree.response");
    expect(detail).to.eql(new Changes({ foo: "Foo"}));
  });

  it("fires error", async () => {
    page.error("foo");
    detail = await pageEvent("otree.error");
    expect(detail).to.eql({ code: "foo"});
    detail = await pageEvent("otree.update");
    expect(detail).to.deep.equal({ error: { code: "foo"} });
  });

  it("fires error with message", async () => {
    page.error("foo", "Foo");
    detail = await pageEvent("otree.error");
    expect(detail).to.eql({ code: "foo", message: "Foo"});
    detail = await pageEvent("otree.update");
    expect(detail).to.deep.equal({ error: { code: "foo", message: "Foo"} });
  });

  it("resets error", async () => {
    page.error("foo");
    detail = await pageEvent("otree.error");
    expect(detail).to.eql({ code: "foo"});
    detail = await pageEvent("otree.update");
    expect(detail).to.deep.equal({ error: { code: "foo"} });

    page.error(null);
    detail = await pageEvent("otree.error");
    expect(detail).to.be.null;
    detail = await pageEvent("otree.update");
    expect(detail).to.deep.equal({ error: undefined });
  });

  it("toggles phases", async () => {
    page.toggle({foo: "Foo"});
    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ foo: "Foo" });
    expect(page.phase).to.eql({ foo: "Foo" });

    page.toggle({bar: "Bar"});
    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ bar: "Bar" });
    expect(page.phase).to.eql({ bar: "Bar" });
  });

  it("fires timeout", async () => {
    page.timeout();
    detail = await pageEvent("otree.timeout");
    expect(detail).to.be.null;
  });

  it("fires status", async () => {
    page.status({ foo: "Foo", bar: "Bar"});
    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ foo: "Foo", bar: "Bar"});
    detail = await pageEvent("otree.update");
    expect(detail).to.eql(new Changes({ 'status.foo': "Foo", 'status.bar': "Bar"}));
  });

});
