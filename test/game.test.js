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
    page.fire(type, data);
    await oneEvent(body, type);
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
    game = new Game(page);
  });

  describe("methods", () => {
    it("resets", async () => {
      game.reset();

      expect(game.state).to.eql({});

      detail = await pageEvent("ot.reset");
      expect(detail).to.eq("game");

      detail = await pageEvent("ot.update");
      expect(detail).to.eql(new Changes({ game: undefined }));
    });

    it("starts", async () => {
      game.start({ foo: "Bar" });

      detail = await pageEvent("ot.started");
      expect(detail).to.eql({ foo: "Bar" });
    });

    it("status", async () => {
      game.status({ foo: "Bar" });

      detail = await pageEvent("ot.status");
      expect(detail).to.eql({ foo: "Bar" });
    });

    it("updates", async () => {
      game.state = { foo: "Foo" };
      game.update({ bar: "Bar" });

      detail = await pageEvent("ot.update");
      expect(detail).to.eql(new Changes({ "game.bar": "Bar" }));
      expect(game.state).to.eql({ foo: "Foo", bar: "Bar" });
    });

    it("stops", async () => {
      game.complete({ foo: "Bar" });

      detail = await pageEvent("ot.completed");
      expect(detail).to.eql({ foo: "Bar" });
    });

    it("errors", async () => {
      game.error("code", "message");
      detail = await pageEvent("ot.error");
      expect(detail).to.eql({ code: "code", message: "message" });

      detail = await pageEvent("ot.update");
      expect(detail).to.eql(new Changes({ error: { code: "code", message: "message" } }));
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

    it("sets up iteration", async () => {
      let running = game.playIterations(2, 0);

      detail = await pageEvent("ot.started");
      expect(detail).to.eql({ iteration: 1 });
      game.complete({});

      detail = await pageEvent("ot.started");
      expect(detail).to.eql({ iteration: 2 });
      game.complete({});

      await running;
    });

    it("iterates loop", async () => {
      let counter = 0;
      page.on("ot.started", () => {
        counter++;
        game.complete({});
      });

      await game.playIterations(10, 0);

      expect(counter).to.eql(10);
    });

    it("terminates loop", async () => {
      let counter = 0;
      page.on("ot.started", () => {
        counter++;
        game.complete({
          terminate: counter == 5,
        });
      });

      await game.playIterations(10, 0);

      expect(counter).to.eql(5);
    });

    it("iterates infinite loop", async () => {
      let counter = 0;
      page.on("ot.started", () => {
        counter++;
        game.complete({
          terminate: counter == 5,
        });
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

      page.on("ot.update", (ev, data) => {
        if (data.has("progress")) progress = data.get("progress");
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

  describe("handlers", () => {
    it("onStart", async () => {
      let called;
      game.onStart = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.started", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onStatus", async () => {
      let called;
      game.onStatus = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.status", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onInput", async () => {
      let called;
      game.onInput = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.input", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onError", async () => {
      let called;
      game.onError = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.error", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onTimeout", async () => {
      let called;
      game.onTimeout = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.timeout", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onPhase", async () => {
      let called;
      game.onPhase = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.phase", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });

    it("onComplete", async () => {
      let called;
      game.onComplete = function () {
        called = Array.from(arguments);
      };

      await pageFire("ot.completed", { foo: "Foo" });

      expect(called).to.eql([{ foo: "Foo" }]);
    });
  });
});
