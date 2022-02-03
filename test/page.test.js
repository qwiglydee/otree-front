import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";


function spy(fn) {
  let spied = {
    count: 0,
  };
  let orig = fn || function(){};

  function wrapped() {
    spied.count ++;
    spied.args = Array.from(arguments);
    return orig.apply(null, arguments);
  }

  wrapped.spied = spied
  return wrapped;
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

      page.reset();
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(null);
    });

    it("resets custom vars", async () => {
      await pageEvent("ot.reset"); // initial

      page.reset(["foo", "bar"]);
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(["foo", "bar"]);
    });

    it("update", async () => {
      page.update({ foo: "Foo" });
      detail = await pageEvent("ot.update");
      expect(detail).to.eql(new Changes({ foo: "Foo" }));
    });

    it("timeout", async () => {
      page.timeout();
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
      page.emitElemEvent(elem, "foo", { bar: "Bar" });
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });
    });

    it("binds", async () => {
      let handler = spy();
      page.onEvent("foo", handler);
      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");

      expect(handler.spied.count).to.eq(1);
      expect(handler.spied.args[0]).to.be.instanceof(CustomEvent);
      expect(handler.spied.args[1]).to.eql({ bar: "Bar" });
    });

    it("binds to elem", async () => {
      let handler = spy();
      page.onElemEvent(elem, "foo", handler);
      page.emitElemEvent(elem, "foo", { bar: "Bar" });  
      await elemEvent("foo");

      expect(handler.spied.count).to.eq(1);
      expect(handler.spied.args[0]).to.be.instanceof(CustomEvent);
      expect(handler.spied.args[1]).to.eql({ bar: "Bar" });
    });

    it("waits", async () => {
      let waiting, result;
      waiting = page.waitForEvent("foo");
      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");
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

    it("onInput", async () => {
      let handler = spy()
      page.onInput = handler;

      await pageFire("ot.input", { name: "foo", value: "Foo" });
      expect(handler.spied.args).to.eql(["foo", "Foo"]);
    });

    it("onUpate", async () => {
      let handler = spy()
      page.onUpdate = handler;

      await pageFire("ot.update", { foo:  "Foo" });
      expect(handler.spied.args).to.eql([{ foo: "Foo" }]);
    });

    it("onTimeout", async () => {
      let handler = spy()
      page.onTimeout = handler;

      await pageFire("ot.timeout", 1000);
      expect(handler.spied.args).to.eql([1000]);
    });
  });
});
