import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

import { spy } from "./util";

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
      page = new Page(body);
      await pageEvent("ot.reset"); // initial reset
    });

    it("onStatus", async () => {
      page.onStatus = spy();
      await pageFire("ot.status", { foo: "Foo" });
      expect(page.onStatus.spied.args).to.eql([{ "foo": "Foo" }]);
    });

    it("onInput", async () => {
      page.onInput = spy();
      await pageFire("ot.input", { name: "foo", value: "Foo" });
      expect(page.onInput.spied.args).to.eql(["foo", "Foo"]);
    });

    it("onUpdate", async () => {
      page.onUpdate = spy();
      await pageFire("ot.update", { foo:  "Foo" });
      expect(page.onUpdate.spied.args).to.eql([{ foo: "Foo" }]);
    });

    it("onTimeout", async () => {
      page.onTimeout = spy();
      await pageFire("ot.timeout", 1000);
      expect(page.onTimeout.spied.args).to.eql([1000]);
    });
  });
});
