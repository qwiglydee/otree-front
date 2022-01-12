import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

describe("Page", () => {
  let body, page, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function elemEvent(type) {
    return (await oneEvent(elem, type)).detail;
  }

  describe("emitting", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("resets", async () => {
      page.emitReset();
      detail = await pageEvent("ot.reset");
      expect(detail).to.eql(["game"]);
    });

    it("resets custom vars", async () => {
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
      page.emitInput({ foo: "Foo" });
      detail = await pageEvent("ot.input");
      expect(detail).to.eql({ foo: "Foo" });
    });

    it("timeout", async () => {
      page.emitTimeout();
      await pageEvent("ot.timeout");
    });
  });


  describe("events", () => {
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
      waiting = page.waitEvent("foo");
      page.emitEvent("foo", { bar: "Bar" });
      await pageEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });

    it("waits on elem", async () => {
      let waiting, result;
      waiting = page.waitEvent("foo", elem);
      page.emitEvent("foo", { bar: "Bar" }, elem);
      await elemEvent("foo");
      result = await waiting;
      expect(result).to.be.instanceof(CustomEvent);
    });
  });

  describe("phases", () => {
    it("initializes", async () => {
      page.init();
      expect(page.phase).to.eql({ display: null, input: false });
    });

    it("resets", async () => {
      page.resetPhase();
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ display: null, input: false });
      expect(page.phase).to.eql({ display: null, input: false });
    })

    it("resets custom flags", async () => {
      page.resetPhase({ foo: "Foo", input: true });
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ display: null, input: true, foo: "Foo" });
      expect(page.phase).to.eql({ display: null, input: true, foo: "Foo" });
    });

    it("toggles", async () => {
      page.resetPhase();
      await pageEvent("ot.phase");

      page.togglePhase({ display: "foo", input: false });
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ display: "foo", input: false });
      expect(page.phase).to.eql({ display: "foo", input: false });

      page.togglePhase({ input: true });
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ input: true });
      expect(page.phase).to.eql({ display: "foo", input: true });
    });

    it("switches display", async () => {
      page.resetPhase();
      await pageEvent("ot.phase");

      page.switchDisplay("foo");
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ display: "foo" });
      expect(page.phase).to.eql({ display: null, input: false });
    });

    it("freezes/unfreezes inputs", async () => {
      page.resetPhase({ input: true });
      await pageEvent("ot.phase");
      expect(page.phase.input).to.be.true;

      page.freezeInputs();
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ input: false });
      expect(page.phase.input).to.be.true;

      page.unfreezeInputs();
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ input: true });
      expect(page.phase.input).to.be.true;
    });

    it("doesn't unfreeze after phase change", async () => {
      page.resetPhase({ input: true });
      await pageEvent("ot.phase");
      expect(page.phase.input).to.be.true;

      page.freezeInputs();
      detail = await pageEvent("ot.phase");
      expect(detail).to.eql({ input: false });
      expect(page.phase.input).to.be.true;

      page.togglePhase({ input: false });
      await pageEvent("ot.phase");
      expect(page.phase.input).to.be.false;

      page.unfreezeInputs();
      let emitted = false; 
      oneEvent(body, "ot.phase").then(() => { emitted = true; });
      await aTimeout(1000);
      expect(emitted).to.be.false;
      expect(page.phase.input).to.be.false;
    });
  });
});
