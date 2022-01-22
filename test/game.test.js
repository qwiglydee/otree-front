import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Changes } from "../src/utils/changes";

import { Page } from "../src/page";
import { Game } from "../src/game";
import { sleep } from "../src/utils/timers";

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

function init() {
  let body = document.createElement("body");
  let page = new Page(body);
  let game = new Game(page);
  return { body, page, game };
}

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
    game.setConfig({ foo: "Foo" });
    expect(game.config).to.eql({ foo: "Foo" });
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ config: { foo: "Foo" } }));
  });

  it("resets and loads trial", async () => {
    await pageEvent("ot.reset"); // initial

    let loadtrial = spy(game, "loadTrial", function () {});

    game.resetTrial();

    expect(game.trial).to.eql({});
    expect(game.status).to.eql({});
    expect(game.feedback).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["trial", "status", "feedback"]);

    expect(loadtrial.args).to.eql([]);
  });

  it("sets and starts trial", async () => {
    let starttrial = spy(game, "startTrial", function () {});

    let trial = { foo: "Foo" };
    game.setTrial(trial);
    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ trial }));

    expect(starttrial.args).to.eql([trial]);
  });

  it("updates trial", async () => {
    game.trial = { foo: "Foo", bar: "Bar" };
    game.updateTrial({ bar: "Bar2", baz: "Baz" });
    expect(game.trial).to.eql({ foo: "Foo", bar: "Bar2", baz: "Baz" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ "trial.bar": "Bar2", "trial.baz": "Baz" }));
  });

  it("updates status", async () => {
    let onstatus = spy(game, "onStatus", function () {});

    game.status = { foo: "Foo", bar: "Bar" };
    game.updateStatus({ bar: "Bar2", baz: "Baz" });

    expect(game.status).to.eql({ foo: "Foo", bar: "Bar2", baz: "Baz" });

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ status: { bar: "Bar2", baz: "Baz" } }));

    detail = await pageEvent("ot.status");
    expect(detail).to.eql({ bar: "Bar2", baz: "Baz" });

    expect(onstatus.args).to.eql([{ foo: "Foo", bar: "Bar2", baz: "Baz" }, { bar: "Bar2", baz: "Baz" }]);
  });

  it("emits started", async () => {
    game.updateStatus({ trialStarted: true });
    await pageEvent("ot.started");
  });

  it("emits completed", async () => {
    game.updateStatus({ trialCompleted: true });
    await pageEvent("ot.completed");
  });

  it("emits gameover", async () => {
    game.updateStatus({ gameOver: true });
    await pageEvent("ot.gameover");
  });

  it("sets feedback", async () => {
    let onfeedback = spy(game, "onFeedback", function () {});

    let feedback = { foo: "Foo" };

    game.setFeedback(feedback);
    expect(game.feedback).to.eql(feedback);

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ feedback }));

    expect(onfeedback.args).to.eql([feedback]);
  });

  it("clears feedback", async () => {
    await pageEvent("ot.reset"); // initial

    let onfeedback = spy(game, "onFeedback", function () {});

    game.feedback = { foo: "Foo" };
    game.clearFeedback();
    expect(game.feedback).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["feedback"]);

    expect(onfeedback.args).to.be.undefined;
  });

  it("sets progress", async () => {
    let onprogress = spy(game, "onProgress", function () {});

    let progress = { foo: "Foo" };

    game.setProgress(progress);
    expect(game.progress).to.eql(progress);

    detail = await pageEvent("ot.update");
    expect(detail).to.eql(new Changes({ progress }));

    expect(onprogress.args).to.eql([progress]);
  });

  it("clears progress", async () => {
    await pageEvent("ot.reset"); // initial

    let onprogress = spy(game, "onProgress", function () {});

    game.progress = { foo: "Foo" };
    game.resetProgress();
    expect(game.progress).to.be.undefined;

    detail = await pageEvent("ot.reset");
    expect(detail).to.eql(["progress"]);

    expect(onprogress.args).to.be.undefined;
  });

  describe("handling events", () => {
    it("onReady", async () => {
      let onready = spy(game, "onReady", function () {});

      await pageFire("ot.ready");

      expect(onready.args).to.eql([]);
    });

    it("onInput", async () => {
      let oninput = spy(game, "onInput", function () {});

      await pageFire("ot.input", { name: 'foo', value:"Foo" });

      expect(oninput.args).to.eql(['foo', "Foo"]);
    });

    it("onPhase", async () => {
      await pageEvent("ot.phase"); // initial;

      let onphase = spy(game, "onPhase", function () {});

      await pageFire("ot.phase", { foo: "Foo" });

      expect(onphase.args).to.eql([{ foo: "Foo" }]);
    });

    it("onPhase ignores freezing", async () => {
      await pageEvent("ot.phase"); // initial;

      let onphase = spy(game, "onPhase", function () {});

      page.togglePhase({inputEnabled: true });
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
      let ontimeout = spy(game, "onTimeout", function () {});

      await pageFire("ot.timeout", 1000);

      expect(ontimeout.args).to.eql([1000]);
    });

    it("onStatus", async () => {
      game.status = { foo: "Foo" };

      let onstatus = spy(game, "onStatus", function () {});

      await pageFire("ot.status", { bar: "Bar" });

      expect(onstatus.args).to.eql([{ foo: "Foo" }, { bar: "Bar" }]);
    });
  });
});

describe("Game playing", () => {
  // variables or events leak somehow

  it("plays a trial async", async () => {
    const { body, page, game } = init();
    let iter = 0;

    game.loadTrial = function () {
      game.setTrial({ foo: "Foo" });
    };

    game.startTrial = async function (trial) {
      game.updateStatus({ trialStarted: true });
      await sleep(100);
      game.updateStatus({ trialCompleted: true });
    };

    game.onStatus = function (status, changed) {
      if (changed.trialCompleted) {
        game.updateStatus({ gameOver: true });
      }
    };

    let starttrial = spy(game, "startTrial");

    const t0 = Date.now();
    await game.playTrial();
    const t1 = Date.now();

    expect(starttrial.count).to.eq(1);
    expect(starttrial.args).to.eql([{ foo: "Foo" }]);
    expect(t1 - t0).to.be.within(100, 110);
  });

  it("plays a trial eventual", async () => {
    const { body, page, game } = init();
    async function pageEvent(type) {
      return (await oneEvent(body, type)).detail;
    }
  
    let iter = 0;

    game.loadTrial = function () {
      game.setTrial({ foo: "Foo" });
    };

    game.startTrial = async function (trial) {
      game.updateStatus({ trialStarted: true });
      await sleep(100);
      game.updateStatus({ trialCompleted: true });
    };

    game.onStatus = function (status, changed) {
      if (changed.trialCompleted) {
        game.updateStatus({ gameOver: true });
      }
    };

    game.playTrial();
    const t0 = Date.now();
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    const t1 = Date.now();

    expect(t1 - t0).to.be.within(100, 110);
  });

  it("plays iterations async", async () => {
    const { body, page, game } = init();
    let iter = 0;

    game.setConfig({ post_trial_pause: 200 });

    game.loadTrial = async function () {
      game.setTrial({ foo: "Foo" });
    };

    game.startTrial = async function (trial) {
      iter++;
      game.updateStatus({ trialStarted: true });
      await sleep(100);
      game.updateStatus({ trialCompleted: true });
    };

    game.onStatus = function (status, changed) {
      if (changed.trialCompleted && iter == 5) {
        game.updateStatus({ gameOver: true });
      }
    };

    let starttrial = spy(game, "startTrial");

    const t0 = Date.now();
    await game.playIterations();
    const t1 = Date.now();

    expect(starttrial.count).to.eq(5);
    expect(t1 - t0).to.be.within(1500, 1550);
  });

  it("plays iterations eventual", async () => {
    const { body, page, game } = init();
    async function pageEvent(type) {
      return (await oneEvent(body, type)).detail;
    }
    let iter = 0;

    game.setConfig({ post_trial_pause: 200 });

    game.loadTrial = async function () {
      game.setTrial({ foo: "Foo" });
    };

    game.startTrial = async function (trial) {
      iter++;
      game.updateStatus({ trialStarted: true });
      await sleep(100);
      game.updateStatus({ trialCompleted: true });
    };

    game.onStatus = function (status, changed) {
      if (changed.trialCompleted && iter == 5) {
        game.updateStatus({ gameOver: true });
      }
    };

    game.playIterations();
    const t0 = Date.now();
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    await pageEvent("ot.started");
    await pageEvent("ot.completed");
    await pageEvent("ot.gameover");
    const t1 = Date.now();

    expect(t1 - t0).to.be.within(1500-200, 1550-200);
  });
});
