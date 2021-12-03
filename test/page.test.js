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
    detail = await pageEvent("ot.reset");
    expect(detail).to.eq("game");
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ game: undefined }));
  });

  it("resets custom obj", async () => {
    page.reset("status.progress");
    detail = await pageEvent("ot.reset");
    expect(detail).to.eq("status.progress");
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ "status.progress": undefined }));
  });

  // it("random on target", async () => {
  //   page.fire("foo", { bar: "Bar" }, elem);
  //   detail = await elemEvent("foo");
  //   expect(detail).to.eql({ bar: "Bar" });
  // });

  it("update", async () => {
    page.update({ foo: "Foo" });
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ foo: "Foo" }));
  });

  it("input", async () => {
    page.input({ foo: "Foo" });
    detail = await pageEvent("ot.input");
    expect(detail).to.eql({ foo: "Foo" });
  });

  it("toggle", async () => {
    page.toggle({ foo: "Foo" });
    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ foo: "Foo" });
  });

  it("timeout", async () => {
    page.timeout();
    await pageEvent("ot.timeout");
  });

  it("freezes", async () => {
    page.freeze();
    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ input: false });
  });

  it("unfreezes", async () => {
    page.unfreeze();
    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ input: true });
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

  describe("page", () => {
    
    it("fires", async () => {
      page.fire("foo", { bar: "Bar" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    });

    it("binds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.on("foo", handler);

      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");

      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
      expect(called[1]).to.eql({ bar: "Bar" });
    });

    it("unbinds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.on("foo", handler);

      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");
      expect(called).not.to.be.undefined;

      called = undefined;
      wrapper.off();

      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");
      expect(called).to.be.undefined;
    });

    it("waits", async () => {
      let waiting, result;
      waiting = page.wait("foo");
      page.fire("foo", { bar: "Bar" });
      await pageEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });
  });

  describe("elem", () => {
    
    it("fires", async () => {
      page.fire("foo", { bar: "Bar" }, elem);
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    });

    it("binds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.on("foo", handler, elem);
 
      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");

      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
      expect(called[1]).to.eql({ bar: "Bar" });
    });

    it("unbinds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.on("foo", handler, elem);

      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      expect(called).not.to.be.undefined;

      called = undefined;
      wrapper.off();

      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      expect(called).to.be.undefined;
    });

    it("waits", async () => {
      let waiting, result;
      waiting = page.wait("foo", elem);
      page.fire("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });
  });
});
