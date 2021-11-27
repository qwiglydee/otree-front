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
    detail = await pageEvent("otree.page.reset");
    expect(detail).to.eq("game");
    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ game: undefined }));
  });

  it("resets custom obj", async () => {
    page.reset("status.progress");
    detail = await pageEvent("otree.page.reset");
    expect(detail).to.eq("status.progress");
    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ "status.progress": undefined }));
  });

  // it("random on target", async () => {
  //   page.fire("foo", { bar: "Bar" }, elem);
  //   detail = await elemEvent("foo");
  //   expect(detail).to.eql({ bar: "Bar" });
  // });

  it("start", async () => {
    page.start();
    detail = await pageEvent("otree.page.start");
    expect(detail).to.be.null;
  });

  it("update", async () => {
    page.update({ foo: "Foo" });
    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ foo: "Foo" }));
  });

  it("response", async () => {
    page.response({ foo: "Foo" });
    detail = await pageEvent("otree.page.response");
    expect(detail).to.eql({ foo: "Foo" });
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
