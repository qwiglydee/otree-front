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
      await pageEvent("ot.phase"); // initial reset
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

    it("onPhase", async () => {
      let onphase = spy(page, "onPhase", function () {});

      await pageFire("ot.phase", { foo: "Foo" });

      expect(onphase.args).to.eql([{ foo: "Foo" }]);
    });

    it("onPhase ignores freezing", async () => {
      let onphase = spy(page, "onPhase", function () {});

      page.togglePhase({ inputEnabled: true });
      await pageEvent("ot.phase");

      expect(onphase.count).to.eq(1);

      page.freezeInputs();
      await pageEvent("ot.phase");

      expect(onphase.count).to.eq(1);

      page.unfreezeInputs();
      await pageEvent("ot.phase");

      expect(onphase.count).to.eq(1);
    });

    it("onTimeout", async () => {
      let ontimeout = spy(page, "onTimeout", function () {});

      await pageFire("ot.timeout", 1000);

      expect(ontimeout.args).to.eql([1000]);
    });
  });

  // describe("phases", () => {

  //   beforeEach(async () => {
  //     await pageEvent("ot.phase"); // initial reset
  //   });

  //   it("initializes", async () => {
  //     page.init();
  //     expect(page.phase).to.eql({ display: null, inputEnabled: false });
  //   });

  //   it("resets", async () => {
  //     page.resetPhase();
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ display: null, inputEnabled: false, _resetting: true });
  //     expect(page.phase).to.eql({ display: null, inputEnabled: false });
  //   });

  //   it("resets custom flags", async () => {
  //     page.resetPhase({ foo: "Foo", inputEnabled: true });
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ display: null, inputEnabled: true, foo: "Foo", _resetting: true });
  //     expect(page.phase).to.eql({ display: null, inputEnabled: true, foo: "Foo" });
  //   });

  //   it("toggles", async () => {
  //     page.resetPhase();
  //     await pageEvent("ot.phase");

  //     page.togglePhase({ display: "foo", inputEnabled: false });
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ display: "foo", inputEnabled: false });
  //     expect(page.phase).to.eql({ display: "foo", inputEnabled: false });

  //     page.togglePhase({ inputEnabled: true });
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ inputEnabled: true });
  //     expect(page.phase).to.eql({ display: "foo", inputEnabled: true });
  //   });

  //   it("switches display", async () => {
  //     page.resetPhase();
  //     await pageEvent("ot.phase");

  //     page.switchDisplay("foo");
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ display: "foo", _switching: true });
  //     expect(page.phase).to.eql({ display: null, inputEnabled: false });
  //   });

  //   it("freezes/unfreezes inputs", async () => {
  //     page.resetPhase({ inputEnabled: true });
  //     await pageEvent("ot.phase");
  //     expect(page.phase.inputEnabled).to.be.true;

  //     page.freezeInputs();
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ inputEnabled: false, _freezing: true });
  //     expect(page.phase.inputEnabled).to.be.true;

  //     page.unfreezeInputs();
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ inputEnabled: true, _freezing: true });
  //     expect(page.phase.inputEnabled).to.be.true;
  //   });

  //   it("doesn't unfreeze after phase change", async () => {
  //     page.resetPhase({ inputEnabled: true });
  //     await pageEvent("ot.phase");
  //     expect(page.phase.inputEnabled).to.be.true;

  //     page.freezeInputs();
  //     detail = await pageEvent("ot.phase");
  //     expect(detail).to.eql({ inputEnabled: false, _freezing: true });
  //     expect(page.phase.inputEnabled).to.be.true;

  //     page.togglePhase({ inputEnabled: false });
  //     await pageEvent("ot.phase");
  //     expect(page.phase.inputEnabled).to.be.false;

  //     page.unfreezeInputs();
  //     let emitted = false;
  //     oneEvent(body, "ot.phase").then(() => {
  //       emitted = true;
  //     });
  //     await aTimeout(1000);
  //     expect(emitted).to.be.false;
  //     expect(page.phase.inputEnabled).to.be.false;
  //   });
  // });
});
