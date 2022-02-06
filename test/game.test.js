import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Game } from "../src/game";
import { sleep } from "../src/utils/timers";

import { spy, flatmap } from "./util";

describe("Game", () => {
  let body, page, game, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function pageFire(type, data) {
    page.emitEvent(type, data);
    await oneEvent(body, type);
  }

  beforeEach(async () => {
    body = document.createElement("body");
    page = new Page(body);
    game = new Game(page);
    await pageEvent("ot.reset"); // initial
  });

  it("setups", async () => {
    game.setConfig({ foo: "Foo" });
    expect(game.config).to.eql({ foo: "Foo" });
    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ config: { foo: "Foo" } });
  });

  it("resets trial", async () => {
    game.loadTrial = spy();

    game.resetTrial();

    expect(game.trial).to.eql({});
    expect(game.status).to.eql({});
    expect(game.feedback).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["trial", "status", "feedback"]);

    expect(game.loadTrial.spied.count).to.eq(1);
  });

  it("starts trial", async () => {
    let trial = { foo: "Foo" };

    await game.startTrial(trial);

    expect(game.trial).to.eql(trial);

    detail = await pageEvent("ot.status");
    expect(detail).to.eql({ trialStarted: true });

    detail = await pageEvent("ot.trial.started");

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ "status.trialStarted": true });

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ trial: { foo: "Foo" } });
  });

  it("preloads images", async () => {
    let img =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=";
    let trial = { foo: img };
    game.config.media_fields = { foo: "image" };

    await game.startTrial(trial);

    expect(game.trial.foo).to.be.instanceOf(Image);
    expect(game.trial.foo.src).to.eq(img);
  });

  it("updates trial", async () => {
    game.trial = { foo: "Foo", bar: "Bar" };

    game.updateTrial({ bar: "Bar2", baz: "Baz" });

    expect(game.trial).to.eql({ foo: "Foo", bar: "Bar2", baz: "Baz" });

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ "trial.bar": "Bar2", "trial.baz": "Baz" });
  });

  it("updates status", async () => {
    game.status = { foo: "Foo", bar: "Bar" };

    game.updateStatus({ bar: "Bar2", baz: "Baz" });

    expect(game.status).to.eql({ foo: "Foo", bar: "Bar2", baz: "Baz" });

    detail = await pageEvent("ot.status");
    expect(detail).to.eql({ bar: "Bar2", baz: "Baz" });

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ "status.bar": "Bar2", "status.baz": "Baz" });
  });

  it("emits started", async () => {
    game.updateStatus({ trialStarted: true });
    await pageEvent("ot.trial.started");
  });

  it("emits completed", async () => {
    game.updateStatus({ trialCompleted: true });
    await pageEvent("ot.trial.completed");
  });

  it("emits gameover", async () => {
    game.updateStatus({ gameOver: true });
    await pageEvent("ot.game.over");
  });

  it("sets feedback", async () => {
    let feedback = { foo: "Foo" };

    game.setFeedback(feedback);

    expect(game.feedback).to.eql(feedback);

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ feedback });
  });

  it("clears feedback", async () => {
    game.feedback = { foo: "Foo" };

    game.clearFeedback();

    expect(game.feedback).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["feedback"]);
  });

  it("sets progress", async () => {
    let progress = { foo: "Foo" };

    game.setProgress(progress);

    expect(game.progress).to.eql(progress);

    detail = await pageEvent("ot.update");
    expect(flatmap(detail)).to.eql({ progress });
  });

  it("clears progress", async () => {
    game.progress = { foo: "Foo" };

    game.resetProgress();

    expect(game.progress).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["progress"]);
  });
});

describe("Game playing", async () => {
  // variables or events leak somehow from here
  let body, page, game;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async function init() {
    body = document.createElement("body");
    page = new Page(body);
    game = new Game(page);
    await pageEvent("ot.reset"); // initial
  });

  it("plays a trial async", async () => {
    game.loadTrial = function () {
      game.startTrial({ foo: "Foo" });
    };

    page.onStatus = async function (changed) {
      if (changed.trialStarted) {
        await sleep(100);
        game.updateStatus({ trialCompleted: true, gameOVer: true });
      }
    };

    const t0 = Date.now();
    await game.playTrial();
    const t1 = Date.now();

    expect(t1 - t0).to.be.within(100, 110);
  });

  it("plays iterations async", async () => {
    let iter = 0,
      max_iters = 5;

    game.setConfig({ post_trial_pause: 200 });

    game.loadTrial = async function () {
      game.startTrial({ foo: "Foo" });
    };

    page.onStatus = async function (changed) {
      if (changed.trialStarted) {
        iter += 1;
        await sleep(100);
        game.updateStatus({ trialCompleted: true, gameOver: iter >= max_iters });
      }
    };

    const t0 = Date.now();
    await game.playIterations();
    const t1 = Date.now();

    expect(iter).to.eq(5);
    expect(t1 - t0).to.be.within(1500, 1550);
  });
});
