import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Schedule } from "../src/utils/schedule.mjs";
import { Game } from "../src/game.mjs";
import { Live } from "../src/live.mjs";

const CONF = {
  num_rounds: undefined,
  nogo_response: "skipped",
  trial_pause: 1000,
};

const page = new Page();
const live = new Live(page);

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
  live.send("load");
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
  live.send("response", { response: input.response });
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

game.reset();

live.send("start");
let initevent = await page.wait("otree.live.status");
CONF.num_rounds = initevent.detail.progress.total;

console.debug("playing:", CONF);

await page.wait("otree.page.start"); // for user to press 'start'

let progress = await game.iterateRounds(CONF, CONF.num_rounds, CONF.trial_pause);

game.reset();

console.debug("terminated:", progress);
