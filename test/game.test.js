import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Changes } from "../src/utils/changes";

import { Page } from "../src/page";
import { Game } from "../src/game";

describe("base game", () => {
  let body, page, game, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  let counters = {
    start: 0,
    stop: 0,
    foo: 0,
    onError: 0,
  };
  let passed = {
    foo: null,
    onError: null,
  };

  class TestGame extends Game {
    start() {
      counters.start++;
    }

    stop() {
      counters.stop++;
    }

    onFoo() {
      counters.foo++;
      passed.foo = arguments;
    }

    onError() {
      counters.onError++;
      passed.onError = arguments;
    }
  }


  describe("basics", () => {
    beforeEach(() => {
      body = document.createElement("body");
      page = new Page(body);
      game = new TestGame(page);
    });

    it("handles events", async () => {
      counters = { foo: 0 };
      game.on("test.foo", game.onFoo);

      page.fire("test.foo", { foo: "Foo" });
      await pageEvent("test.foo");

      expect(counters).to.eql({ foo: 1 });
      expect(passed.foo.length).to.eql(1);
      expect(passed.foo[0]).to.eql({ foo: "Foo" });
    });

    it("updates state", async () => {
      game.state = { foo: "Foo" };
      game.updateState({ bar: "Bar" });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(new Changes({ bar: "Bar" }));
      expect(game.state).to.eql({ foo: "Foo", bar: "Bar" });
    });

    it("updates status", async () => {
      game.status = { foo: "Foo" };
      game.setStatus({ bar: "Bar" });

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ bar: "Bar" });
      expect(game.status).to.eql({ bar: "Bar" });
    });

    it("freezes", async () => {
      game.freezeInputs();
      detail = await pageEvent("otree.page.phase");
      expect(detail).to.eql({ input: false });
    });

    it("unfreezes", async () => {
      game.unfreezeInputs();
      detail = await pageEvent("otree.page.phase");
      expect(detail).to.eql({ input: true });
    });

    it("fires error", async () => {
      counters = { onError: 0 };
      game.fireError("code", "message");
      detail = await pageEvent("otree.page.error");
      expect(detail).to.eql({ code: "code", message: "message" });
      expect(counters).to.eql({ onError: 1 });
      expect(passed.onError.length).to.eql(1);
      expect(passed.onError[0]).to.eql({ code: "code", message: "message" });
    });
  });

  describe("rounds", () => {
    beforeEach(() => {
      body = document.createElement("body");
      page = new Page(body);
      game = new TestGame(page);
      counters = { start: 0, stop: 0 };
    });

    it("plays a round", async () => {

      let running = game.playRound({ foo: "Foo" });

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({});

      await pageEvent("otree.game.start");
      expect(counters).to.eql({ start: 1, stop: 0 });

      game.setStatus({ bar: "Bar", completed: true });

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ bar: "Bar", completed: true });
      expect(counters).to.eql({ start: 1, stop: 1 });

      let status = await running;
      expect(status).to.eql({ bar: "Bar", completed: true });
    });

    it("waits to complete", async () => {
      counters = { start: 0, stop: 0 };
      let running = game.playRound({ foo: "Foo" });
      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({});

      await pageEvent("otree.game.start");
      expect(counters).to.eql({ start: 1, stop: 0 });

      game.setStatus({ bar: "Bar", completed: true, wait: true });
      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ bar: "Bar", completed: true, wait: true });
      expect(counters).to.eql({ start: 1, stop: 0 });

      page.fire("otree.page.timeout");
      await pageEvent("otree.page.timeout");
      expect(counters).to.eql({ start: 1, stop: 1 });

      let status = await running;
      expect(status).to.eql({ bar: "Bar", completed: true, wait: true });
    });

    it("iterates rounds", async () => {
      counters = { start: 0, stop: 0 };
      page.on("otree.game.start", () => game.setStatus({ completed: true }));
      await game.iterateRounds({}, 10, 0);
      expect(counters).to.eql({ start: 10, stop: 10 });
    });

    it("terminates iteration", async () => {
      counters = { start: 0, stop: 0 };
      let cnt = 0;
      page.on("otree.game.start", () => game.setStatus({ completed: true, terminate: cnt++ >= 3}));
      await game.iterateRounds({}, 10, 0);
      expect(counters).to.eql({ start: 4, stop: 4 });
    });

    it("terminates infinite iteration", async () => {
      counters = { start: 0, stop: 0 };
      let cnt = 0;
      page.on("otree.game.start", () => game.setStatus({ completed: true, terminate: cnt++ >= 3 }));
      await game.iterateRounds({}, null, 0);
      expect(counters).to.eql({ start: 4, stop: 4 });
    });

    it("updates progress", async () => {
      let running = game.iterateRounds({}, 3, 0);

      // iter1

      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 1,
          completed: 0,
          skipped: 0,
          solved: 0,
          failed: 0,
        },
      });

      await pageEvent("otree.game.status"); // from round

      await pageEvent("otree.game.start");
      game.setStatus({ completed: true, success: true });

      await pageEvent("otree.game.status"); // from round

      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 1,
          completed: 1,
          skipped: 0,
          solved: 1,
          failed: 0,
        },
      });

      // iter2

      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 2,
          completed: 1,
          skipped: 0,
          solved: 1,
          failed: 0,
        },
      });

      await pageEvent("otree.game.status"); // from round
    
      await pageEvent("otree.game.start");
      game.setStatus({ completed: true, success: false });

      await pageEvent("otree.game.status"); // from round
    
      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 2,
          completed: 2,
          skipped: 0,
          solved: 1,
          failed: 1,
        },
      });

      // iter3

      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 3,
          completed: 2,
          skipped: 0,
          solved: 1,
          failed: 1,
        },
      });

      await pageEvent("otree.game.status"); // from round

      await pageEvent("otree.game.start");
      game.setStatus({ completed: true });

      await pageEvent("otree.game.status"); // from round

      detail = await pageEvent("otree.game.status"); // from iterator
      expect(detail).to.eql({
        progress: {
          total: 3,
          current: 3,
          completed: 3,
          skipped: 1,
          solved: 1,
          failed: 1,
        },
      });

      let progress = await running;
      expect(progress).to.eql({
        total: 3,
        current: 3,
        completed: 3,
        skipped: 1,
        solved: 1,
        failed: 1,
      });
    });

    it("makes pauses", async () => {
      let running = game.iterateRounds({}, 2, 200);

      // iter 1
      await pageEvent("otree.game.start");
      game.setStatus({ completed: true });
      let t0 = Date.now();

      // iter 2
      await pageEvent("otree.game.start");
      expect(Date.now() - t0).to.be.within(200, 210);
      game.setStatus({ completed: true });

      await running;
    });
  });
});
