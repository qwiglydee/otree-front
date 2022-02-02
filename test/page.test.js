import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

function spy(obj, methodname, fn) {
  let spied = {
    count: 0,
  };
  let orig = fn || obj[methodname];
  obj[methodname] = function () {
    spied.count++;
    spied.args = Array.from(arguments);
    return orig.apply(this, arguments);
  };
  return spied;
}

describe("Page", () => {
  let body, page, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function elemEvent(type) {
    return (await oneEvent(elem, type)).detail;
  }

  async function pageFire(type, data) {
    page.emitEvent(type, data);
    await oneEvent(body, type);
  }

  describe("emitting", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets initially", async () => {
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(null);
    });

    it("resets", async () => {
      await pageEvent("ot.reset"); // initial

      page.emitReset();
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(null);
    });

    it("resets custom vars", async () => {
      await pageEvent("ot.reset"); // initial

      page.emitReset(["foo", "bar"]);
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(["foo", "bar"]);
    });

    it("update", async () => {
      page.emitUpdate({ foo: "Foo" });
      detail = await pageEvent("ot.update");
      expect(detail).to.eql(new Changes({ foo: "Foo" }));
    });

    it("input", async () => {
      page.emitInput("foo", "Foo");
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ name: "foo", value: "Foo" });
    });

    it("timeout", async () => {
      page.emitTimeout();
      await pageEvent("ot.timeout");
    });

    it("freezes", async () => {
      page.freezeInputs();
      detail = await pageEvent("ot.freezing");
      expect(detail).to.eq(true);
    });

    it("unfreezes", async () => {
      page.unfreezeInputs();
      detail = await pageEvent("ot.freezing");
      expect(detail).to.eq(false);
    });
  });

  describe("events", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("emits", async () => {
      page.emitEvent("foo", { bar: "Bar" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    });

    it("emits on elem", async () => {
      page.emitEvent("foo", { bar: "Bar" }, elem);
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    });

    it("binds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.onEvent("foo", handler);

      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");

      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
    });

    it("binds to elem", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      wrapper = page.onEvent("foo", handler, elem);

      page.emitEvent("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");

      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
    });

    it("unbinds", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      page.onEvent("foo", handler);

      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");
      expect(called).not.to.be.undefined;

      called = undefined;
      page.offEvent("foo", handler);

      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");
      expect(called).to.be.undefined;
    });

    it("unbinds from elem", async () => {
      let wrapper, called;

      function handler() {
        called = arguments;
      }

      page.onEvent("foo", handler, elem);

      page.emitEvent("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      expect(called).not.to.be.undefined;

      called = undefined;
      page.offEvent("foo", handler, elem);

      page.emitEvent("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      expect(called).to.be.undefined;
    });

    it("waits", async () => {
      let waiting, result;
      waiting = page.waitForEvent("foo");
      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });

    it("waits on elem", async () => {
      let waiting, result;
      waiting = page.waitForEvent("foo", elem);
      page.emitEvent("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });
  });

  describe("sets handlers", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent("ot.reset"); // initial reset
    });

    it("onReady", async () => {
      let onready = spy(page, "onReady", function () {});

      await pageFire("ot.ready");

      expect(onready.args).to.eql([]);
    });

    it("onInput", async () => {
      let oninput = spy(page, "onInput", function () {});

      await pageFire("ot.input", { name: "foo", value: "Foo" });

      expect(oninput.args).to.eql(["foo", "Foo"]);
    });

    it("onTimeout", async () => {
      let ontimeout = spy(page, "onTimeout", function () {});

      await pageFire("ot.timeout", 1000);

      expect(ontimeout.args).to.eql([1000]);
    });
  });
});
