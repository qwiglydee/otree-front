import { loadImage } from "../src/utils/dom.mjs";

import { LivePage } from "../src/page.mjs";
import { Schedule } from "../src/utils/schedule.mjs";
import { Game } from "../src/game.mjs";

const CONF = {
  nogo_response: "skipped",
  trial_pause: 1000,
};

const page = new LivePage();

const schedule = new Schedule(page, [
  { time: 0, display: "aim" },
  { time: 1000, display: "prime" },
  { time: 1500, display: "target" },
  { time: 1500, input: true, timeout: 3000 },
  { name: "final", display: "final" }, // the phase to show during final waiting and intertrial pause
]);

const game = new Game(page);

game.on("otree.game.start", async function (event) {
  const conf = event.detail;
  console.debug("otree.game.start", conf);
  page.send("load");
});

game.on("otree.live.trial", async function (event) {
  const trial = event.detail;
  console.debug("otree.live.trial", trial);
  trial.stimulus_img = await loadImage(trial.stimulus_img);
  game.update(trial);
  schedule.run();
});

game.on("otree.page.update", function (event) {
  const changes = event.detail;
  console.debug("otree.page.update", changes);
});

game.on("otree.page.response", function (event) {
  const input = event.detail;
  console.debug("otree.page.response", input);
  game.freeze();
  game.update({
    response: input.response,
  });
  page.send("response", { response: input.response });
});

game.on("otree.time.out", function () {
  console.debug("otree.time.out");
  game.freeze();
  if (game.state.response === undefined) {
    // skip if already given
    page.send("response", { response: CONF.nogo_response });
  }
});

game.on("otree.live.feedback", function (event) {
  const message = event.detail;
  console.debug("otree.live.feedback", message);
  game.update({ feedback: message.feedback });
});

game.on("otree.live.status", function (event) {
  const status = event.detail;
  console.debug("otree.live.status", status);
  game.status(status);
});

game.on("otree.game.stop", async function (event) {
  const status = event.detail;
  console.debug("otree.game.stop", status);
  console.debug("completed:", status, game.state);
  schedule.cancel();
});

page.reset();
await page.wait("otree.page.start"); // for user to press 'start'
page.send("init");
await page.wait("otree.live.status").then(event => {
  const message = event.detail;
  CONF.num_rounds = message.progress.total;
});

let proggress = await game.iterateRounds(CONF, CONF.num_rounds, CONF.trial_pause);

page.reset();
console.debug("terminated:", progress);
