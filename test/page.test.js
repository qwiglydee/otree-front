import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

describe("Page", () => {
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
    detail = await pageEvent('otree.page.reset');
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
    detail = await pageEvent("otree.page.start");
    expect(detail).to.be.null;
  });

  it("fires update", async () => {
    page.update({ foo: "Foo" });
    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ foo: "Foo"}));
  });

  it("fires response", async () => {
    page.response({ foo: "Foo" });
    detail = await pageEvent("otree.page.response");
    expect(detail).to.eql(new Changes({ foo: "Foo"}));
  });

  it("fires error", async () => {
    page.error("foo");
    detail = await pageEvent("otree.page.error");
    expect(detail).to.eql({ code: "foo"});
    detail = await pageEvent("otree.page.update");
    expect(detail).to.deep.equal({ error: { code: "foo"} });
  });

  it("fires error with message", async () => {
    page.error("foo", "Foo");
    detail = await pageEvent("otree.page.error");
    expect(detail).to.eql({ code: "foo", message: "Foo"});
    detail = await pageEvent("otree.page.update");
    expect(detail).to.deep.equal({ error: { code: "foo", message: "Foo"} });
  });

  it("resets error", async () => {
    page.error("foo");
    detail = await pageEvent("otree.page.error");
    expect(detail).to.eql({ code: "foo"});
    detail = await pageEvent("otree.page.update");
    expect(detail).to.deep.equal({ error: { code: "foo"} });

    page.error(null);
    detail = await pageEvent("otree.page.error");
    expect(detail).to.be.null;
    detail = await pageEvent("otree.page.update");
    expect(detail).to.deep.equal({ error: undefined });
  });

  it("toggles phases", async () => {
    page.toggle({foo: "Foo"});
    detail = await pageEvent("otree.time.phase");
    expect(detail).to.eql({ foo: "Foo" });
    expect(page.phase).to.eql({ foo: "Foo" });

    page.toggle({bar: "Bar"});
    detail = await pageEvent("otree.time.phase");
    expect(detail).to.eql({ bar: "Bar" });
    expect(page.phase).to.eql({ bar: "Bar" });
  });

  it("fires timeout", async () => {
    page.timeout();
    detail = await pageEvent("otree.time.out");
    expect(detail).to.be.null;
  });
});

describe("events", () => {
  let body, page, elem, detail;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div></div>`, { parentNode: body });
    page = new Page(body);
  });

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function elemEvent(type) {
    return (await oneEvent(elem, type)).detail;
  }

  describe("on page", () => {
    it("binds", async () => {
      let wrapper, called;

      function handler(event, page) {
        called = arguments;
      }

      wrapper = page.on("foo", handler);

      page.fire("foo", { bar: "Bar" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    
      await nextFrame();
      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
      expect(called[1]).to.eq(page);
    });

    it("unbinds", async () => {
      let wrapper, called;

      function handler(event, page) {
        called = arguments;
      }

      wrapper = page.on("foo", handler);

      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");
      await nextFrame();
      expect(called).not.to.be.undefined;

      called = undefined;
      wrapper.off();

      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");
      await nextFrame();
      expect(called).to.be.undefined;
    });

    it("waits", async () => {
      let waiting = page.wait('foo');
      page.fire('foo');
      await pageEvent("foo");
      await waiting;
    });
  });

  describe("on elem", () => {
    it("binds", async () => {
      let wrapper, called;

      function handler(event, page) {
        called = arguments;
      }

      wrapper = page.on("foo", handler, elem);

      page.fire("foo", { bar: "Bar" }, elem);
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    
      await nextFrame();
      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
      expect(called[1]).to.eq(page);
      expect(called[2]).to.eq(elem);
    });

    it("unbinds", async () => {
      let wrapper, called;

      function handler(event, page) {
        called = arguments;
      }

      wrapper = page.on("foo", handler, elem);

      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      await nextFrame();
      expect(called).not.to.be.undefined;

      called = undefined;
      wrapper.off();

      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      await nextFrame();
      expect(called).to.be.undefined;
    });

    it("waits", async () => {
      let waiting = page.wait('foo', elem);
      page.fire('foo', {}, elem);
      await elemEvent("foo", elem);
      await waiting;
    });
  });

});
