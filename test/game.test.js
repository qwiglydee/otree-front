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

  it("resets", async () => {
    game.reset();

    expect(game.state).to.eql({});

    detail = await pageEvent("otree.page.reset");
    expect(detail).to.eq("game");

    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ game: undefined }));
  });

  it("starts", async () => {
    game.start({ foo: "Bar" });

    detail = await pageEvent("otree.game.start");
    expect(detail).to.eql({ foo: "Bar" });
  });

  it("status", async () => {
    game.status({ foo: "Bar" });

    detail = await pageEvent("otree.game.status");
    expect(detail).to.eql({ foo: "Bar" });
  });

  it("updates", async () => {
    game.state = { foo: "Foo" };
    game.update({ bar: "Bar" });

    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ "game.bar": "Bar" }));
    expect(game.state).to.eql({ foo: "Foo", bar: "Bar" });
  });

  it("stops", async () => {
    game.stop({ foo: "Bar" });

    detail = await pageEvent("otree.game.stop");
    expect(detail).to.eql({ foo: "Bar" });
  });

  it("errors", async () => {
    game.error("code", "message");
    detail = await pageEvent("otree.game.error");
    expect(detail).to.eql({ code: "code", message: "message" });

    detail = await pageEvent("otree.page.update");
    expect(detail).to.eql(new Changes({ error: { code: "code", message: "message" } }));
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

describe.only("playing", () => {
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

    detail = await pageEvent("otree.game.start");
    expect(detail).to.eql({ iteration: 1 });
    game.stop({});

    detail = await pageEvent("otree.game.start");
    expect(detail).to.eql({ iteration: 2 });
    game.stop({});

    await running;
  });

  it("iterates loop", async () => {
    let counter = 0;
    page.on("otree.game.start", () => {
      counter++;
      game.stop({});
    });

    await game.playIterations(10, 0);

    expect(counter).to.eql(10);
  });

  it("terminates loop", async () => {
    let counter = 0;
    page.on("otree.game.start", () => {
      counter++;
      game.stop({
        terminate: counter == 5,
      });
    });

    await game.playIterations(10, 0);

    expect(counter).to.eql(5);
  });

  it("iterates infinite loop", async () => {
    let counter = 0;
    page.on("otree.game.start", () => {
      counter++;
      game.stop({
        terminate: counter == 5,
      });
    });

    await game.playIterations(null, 0);

    expect(counter).to.eql(5);
  });

  it("makes pauses", async () => {
    let running = game.playIterations(2, 200);

    await pageEvent("otree.game.start");
    game.stop({});

    let t0 = Date.now();
    await pageEvent("otree.game.start");
    expect(Date.now() - t0).to.be.within(200, 210);
  });

  it("updates progress", async () => {
    let progress;

    page.on("otree.page.update", (ev, data) => {
      if (data.has('progress')) progress = data.get('progress');
    });

    let running = game.playIterations(3, 0);

    // iter 1

    await pageEvent("otree.page.reset");

    return;

    expect(progress).to.eql({
      total: 3,
      current: 1,
      completed: 0,
      solved: 0,
      failed: 0,
    });

    await pageEvent("otree.game.start");
    game.stop({ success: true });
    await pageEvent("otree.game.stop");
    
    expect(progress).to.eql({
      total: 3,
      current: 1,
      completed: 1,
      solved: 1,
      failed: 0,
    });

    // iter 2
    
    await pageEvent("otree.page.reset");

    expect(progress).to.eql({
      total: 3,
      current: 2,
      completed: 1,
      solved: 1,
      failed: 0,
    });

    await pageEvent("otree.game.start");
    game.stop({ success: false });
    await pageEvent("otree.game.stop");
    
    expect(progress).to.eql({
      total: 3,
      current: 2,
      completed: 2,
      solved: 1,
      failed: 1,
    });

    // iter 3
    
    await pageEvent("otree.page.reset");

    expect(progress).to.eql({
      total: 3,
      current: 3,
      completed: 2,
      solved: 1,
      failed: 1,
    });

    await pageEvent("otree.game.start");
    game.stop({});
    await pageEvent("otree.game.stop");
    
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
