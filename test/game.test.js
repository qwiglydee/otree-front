import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Changes } from "../src/utils/changes";

import { Page } from "../src/page";
import { Game } from "../src/game";

describe("Game", () => {
  let body, page, game, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function pageFire(type, data) {
    page.emitEvent(type, data);
    await oneEvent(body, type);
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
    game = new Game(page);
  });

  it("setups", async () => {
    game.setup({ foo: "Foo" });

    expect(game.config).to.eql({ foo: "Foo" });
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ config: { foo: "Foo" } }));
  });

  it("resets", async () => {
    game.reset();

    expect(game.state).to.eql({});
    expect(game.status).to.eql({});
    expect(game.result).to.be.undefined;
    expect(game.error).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["game", "status", "error", "result"]);
  });

  it("starts", async () => {
    game.start();
    detail = await pageEvent("ot.started");
  });

  it("completes", async () => {
    game.complete({ foo: "Foo" });

    detail = await pageEvent("ot.completed");
    expect(detail).to.eql({ foo: "Foo" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ result: { foo: "Foo" } }));

    expect(game.result).to.eql({ foo: "Foo" });
  });

  it("sets status", async () => {
    game.status = { foo: "Foo" };
    game.setStatus({ bar: "Bar" });

    detail = await pageEvent("ot.status");
    expect(detail).to.eql({ bar: "Bar" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ status: { bar: "Bar" } }));

    expect(game.status).to.eql({ bar: "Bar" });
  });

  it("updates states", async () => {
    game.state = { foo: "Foo" };
    game.updateState({ bar: "Bar" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ "game.bar": "Bar" }));
    expect(game.state).to.eql({ foo: "Foo", bar: "Bar" });
  });

  it("sets error", async () => {
    game.setError("code", "message");
    detail = await pageEvent("ot.error");
    expect(detail).to.eql({ code: "code", message: "message" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ error: { code: "code", message: "message" } }));

    expect(game.error).to.eql({ code: "code", message: "message" });
  });

  it("clears error", async () => {
    game.error = { code: "code", message: "message" };
    game.clearError();
    detail = await pageEvent("ot.error");
    expect(detail).to.eq(null);

    detail = await pageEvent("ot.reset");
    expect(detail).to.eq("error");

    expect(game.error).to.be.undefined;
  });

  describe("playing", () => {
    it("plays", async () => {
      let playing = game.play();
      await pageEvent("ot.started");

      game.complete({ foo: "Foo"});
      await pageEvent("ot.completed");

      await playing;
    });
  });

  describe("iterating", () => {
    let body, page, game, detail;

    async function pageEvent(type) {
      return (await oneEvent(body, type)).detail;
    }

    beforeEach(() => {
      body = document.createElement("body");
      page = new Page(body);
      game = new Game(page);
    });

    it("increments iteration", async () => {
      let running = game.playIterations(2, 0);

      await pageEvent("ot.started");
      expect(game.iteration).to.eq(1);
      game.complete({});

      await pageEvent("ot.started");
      expect(game.iteration).to.eq(2);
      game.complete({});

      await running;
    });

    it("iterates loop", async () => {
      let counter = 0;
      page.onEvent("ot.started", () => {
        counter++;
        game.complete({});
      });

      await game.playIterations(10, 0);

      expect(counter).to.eql(10);
    });

    it("terminates loop", async () => {
      let counter = 0;
      page.onEvent("ot.started", () => {
        counter++;
        game.complete({});
        if (counter == 5) game.stopIterations();
      });

      await game.playIterations(10, 0);

      expect(counter).to.eql(5);
    });

    it("iterates infinite loop", async () => {
      let counter = 0;
      page.onEvent("ot.started", () => {
        counter++;
        game.complete({});
        if (counter == 5) game.stopIterations();
      });

      await game.playIterations(null, 0);

      expect(counter).to.eql(5);
    });

    it("makes pauses", async () => {
      let running = game.playIterations(2, 200);

      await pageEvent("ot.started");
      game.complete({});

      let t0 = Date.now();
      await pageEvent("ot.started");
      expect(Date.now() - t0).to.be.within(200, 210);
    });

    it("updates progress", async () => {
      let progress;

      page.onEvent("ot.update", (ev) => {
        if (ev.detail.has("progress")) progress = ev.detail.get("progress");
      });

      let running = game.playIterations(3, 0);

      // iter 1

      await pageEvent("ot.reset");

      expect(progress).to.eql({
        total: 3,
        current: 1,
        completed: 0,
        solved: 0,
        failed: 0,
      });

      await pageEvent("ot.started");
      game.complete({ success: true });
      await pageEvent("ot.completed");

      expect(progress).to.eql({
        total: 3,
        current: 1,
        completed: 1,
        solved: 1,
        failed: 0,
      });

      // iter 2

      await pageEvent("ot.reset");

      expect(progress).to.eql({
        total: 3,
        current: 2,
        completed: 1,
        solved: 1,
        failed: 0,
      });

      await pageEvent("ot.started");
      game.complete({ success: false });
      await pageEvent("ot.completed");

      expect(progress).to.eql({
        total: 3,
        current: 2,
        completed: 2,
        solved: 1,
        failed: 1,
      });

      // iter 3

      await pageEvent("ot.reset");

      expect(progress).to.eql({
        total: 3,
        current: 3,
        completed: 2,
        solved: 1,
        failed: 1,
      });

      await pageEvent("ot.started");
      game.complete({});
      await pageEvent("ot.completed");

      expect(progress).to.eql({
        total: 3,
        current: 3,
        completed: 3,
        solved: 1,
        failed: 1,
      });

      let result = await running;

      expect(result).to.eql(progress);
    });
  });

  describe("handling events", () => {
    it("onStart", async () => {
      let called;
      game.onStart = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.started");
      expect(called).not.to.be.undefined;
      expect(called).to.eql([null]);
    });

    it("onStatus", async () => {
      let called;
      game.onStatus = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.status", { foo: "Foo" });

      expect(called).not.to.be.undefined;
      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onPhase", async () => {
      await pageEvent("ot.phase"); // initial;

      let called;
      game.onPhase = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.phase", { foo: "Foo" });

      expect(called).not.to.be.undefined;
      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onPhase ignores freezing", async () => {
      await pageEvent("ot.phase"); // initial;
      page.resetPhase({ input: true });      
      await pageEvent("ot.phase");

      let called;
      game.onPhase = function () {
        called = Array.from(arguments);
      };

      page.freezeInputs();
      await pageEvent("ot.phase");

      expect(called).to.be.undefined;

      page.unfreezeInputs();
      await pageEvent("ot.phase");

      expect(called).to.be.undefined;
    });

    it("onInput", async () => {
      let called;
      game.onInput = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.input", { foo: "Foo" });

      expect(called).not.to.be.undefined;
      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onError", async () => {
      let called;
      game.onError = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.error", { foo: "Foo" });

      expect(called).not.to.be.undefined;
      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onTimeout", async () => {
      let called;
      game.onTimeout = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.timeout");

      expect(called).not.to.be.undefined;
      expect(called).to.eql([null]);
    });

    it("onComplete", async () => {
      let called;
      game.onComplete = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.completed", { foo: "Foo" });

      expect(called).not.to.be.undefined;
      expect(called).to.eql([{ foo: "Foo" }]);
    });
  });
});
