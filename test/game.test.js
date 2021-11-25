import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Changes } from "../src/utils/changes";

import { Page } from "../src/page";
import { Game } from "../src/game";

describe("Game", () => {
  let body, page, game, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
    game = new Game(page);
  });

  describe("events", () => {
    it("binds handler", async () => {
      let called, that;

      game.on("test.foo", function () {
        called = arguments;
        that = this;
      });

      page.fire("test.foo", { foo: "Foo" });
      await pageEvent("test.foo");

      expect(called).not.to.be.undefined;
      expect(called[0]).to.be.instanceof(CustomEvent);
      expect(that).to.eq(game);
    });

    it("freezes", async () => {
      game.freeze();
      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ input: false });
    });

    it("unfreezes", async () => {
      game.unfreeze();
      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ input: true });
    });
  });

  describe("status", () => {
    it("fires", async () => {
      game.status({ bar: "Bar" });

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ bar: "Bar" });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(new Changes({ "status.bar": "Bar" }));
    });

    it("fires error", async () => {
      game.error("code", "message");
      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ error: { code: "code", message: "message" } });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(
        new Changes({ "status.error": { code: "code", message: "message" } })
      );
    });

    it("fires error code only", async () => {
      game.error("code");
      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ error: { code: "code" } });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(new Changes({ "status.error": { code: "code" } }));
    });

    it("fires error none", async () => {
      game.error(null);
      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql({ error: null });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(new Changes({ "status.error": null }));
    });
  });

  describe("state", () => {
    it("updates", async () => {
      game.state = { foo: "Foo" };
      game.update({ bar: "Bar" });

      detail = await pageEvent("otree.page.update");
      expect(detail).to.eql(new Changes({ "game.bar": "Bar" }));
      expect(game.state).to.eql({ foo: "Foo", bar: "Bar" });
    });
  });

  describe("playing", () => {
    it("plays a round", async () => {
      let running = game.playRound({ foo: "Foo" });

      detail = await pageEvent("otree.game.start");
      expect(detail).to.eql({ foo: "Foo" });

      let status = { bar: "Bar", completed: true };
      game.status(status);

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql(status);

      detail = await pageEvent("otree.game.stop");
      expect(detail).to.eql(status);

      let result = await running;
      expect(result).to.eql(status);
    });

    it("waits to complete", async () => {
      let running = game.playRound({ foo: "Foo" });

      detail = await pageEvent("otree.game.start");
      expect(detail).to.eql({ foo: "Foo" });

      let status = { bar: "Bar", completed: true, wait: true };
      game.status(status);

      detail = await pageEvent("otree.game.status");
      expect(detail).to.eql(status);

      page.fire("otree.time.out");
      await pageEvent("otree.time.out");

      detail = await pageEvent("otree.game.stop");
      expect(detail).to.eql(status);

      let result = await running;
      expect(result).to.eql(status);
    });

    it("iterates rounds", async () => {
      let counter = 0;
      page.on("otree.game.start", () => {
        counter++;
        game.status({ completed: true });
      });
      await game.iterateRounds({}, 10, 0);
      expect(counter).to.eql(10);
    });

    it("makes pauses", async () => {
      let running = game.iterateRounds({}, 2, 200);

      // iter 1
      await pageEvent("otree.game.start");
      game.status({ completed: true });
      let t0 = Date.now();

      // iter 2
      await pageEvent("otree.game.start");
      expect(Date.now() - t0).to.be.within(200, 210);
      game.status({ completed: true });

      await running;
    });

    it("terminates iteration", async () => {
      let counter = 0;
      page.on("otree.game.start", () => {
        counter++;
        game.status({ completed: true, terminate: counter >= 4 });
      });
      await game.iterateRounds({}, 10, 0);
      expect(counter).to.eql(4);
    });

    it("terminates infinite iteration", async () => {
      let counter = 0;
      page.on("otree.game.start", () => {
        counter++;
        game.status({ completed: true, terminate: counter >= 4 });
      });
      await game.iterateRounds({}, null, 0);
      expect(counter).to.eql(4);
    });

    it("updates progress", async () => {
      let running = game.iterateRounds({}, 3, 0);

      // iter1

      detail = await pageEvent("otree.game.status");
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

      await pageEvent("otree.game.start");
      game.status({ completed: true, success: true });
      await pageEvent("otree.game.status");
      await pageEvent("otree.game.stop");

      detail = await pageEvent("otree.game.status");
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

      await pageEvent("otree.game.start");
      game.status({ completed: true, success: false });
      await pageEvent("otree.game.status");
      await pageEvent("otree.game.stop");

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

      await pageEvent("otree.game.start");
      game.status({ completed: true });
      await pageEvent("otree.game.status");
      await pageEvent("otree.game.stop");

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

  });
});
