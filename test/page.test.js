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
    it("requires `page` in conf", async () => {
      expect(() => onPage({}, "foo", () => {})).to.throw;
    });

    it("works", async () => {
      let counter = 0;
      let passed = null;
      let wrapper;

      function handler(page, conf, event) {
        counter++;
        passed = arguments;
      }

      wrapper = page.on("foo", handler, { baz: "Baz" });

      page.fire("foo", { bar: "Bar" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });

      expect(counter).to.eq(1);
      expect(passed[0]).to.eq(page);
      expect(passed[1]).to.eql({ baz: "Baz" });
      expect(passed[2]).to.be.instanceof(CustomEvent);

      page.off(wrapper);
      page.fire("foo", { bar: "Bar2" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar2" });

      expect(counter).to.eq(1);
    });

    it("waits", async () => {
      let counter=0;

      page.wait('foo').then(()=>{counter++});
      page.fire('foo');
      await nextFrame();
      expect(counter).to.eq(1);

      page.fire('foo');
      await nextFrame();
      expect(counter).to.eq(1);
    });
  });

  describe("on elem", () => {
    it("requires `target` in conf", async () => {
      expect(() => onPage({}, "foo", () => {})).to.throw;
    });

    it("works", async () => {
      let counter = 0;
      let passed = null;
      let wrapper;

      function handler(page, conf, event) {
        counter++;
        passed = arguments;
      }

      wrapper = page.on("foo", handler, { baz: "Baz" }, elem);

      page.fire("foo", { bar: "Bar" }, elem);
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });

      expect(counter).to.eq(1);
      expect(passed[0]).to.eq(page);
      expect(passed[1]).to.eql({ baz: "Baz" });
      expect(passed[2]).to.be.instanceof(CustomEvent);

      page.off(wrapper);

      page.fire("foo", { bar: "Bar2" }, elem);
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar2" });

      expect(counter).to.eq(1);
    });
  });
});
