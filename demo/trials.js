import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Schedule } from "../src/utils/schedule.mjs";
import { Game } from "../src/game.mjs";

import { generateTrial, validateTrial } from "./trials_data.js";

const CONF = {
  num_rounds: 5,
  num_retries: 3,
  trial_pause: 2000,
};

const page = new Page();

const schedule = new Schedule(page, [
  { display: null, input: false }, // default
  { time: 0, display: "aim" },
  { time: 500, display: "prime" },
  { time: 1000, display: "target", input: true, timeout: 5000 },
  { time: 2000, display: "question" }, // only show target for 1000ms
  { name: "final", display: "target" },
  { name: "results", display: "results" },
]);

const game = new Game(page);

game.on("otree.game.start", async function (event) {
  const conf = event.detail;
  console.debug("otree.game.start", conf);
  const trial = generateTrial(conf.iteration);
  trial.stimulus_img = await loadImage(trial.stimulus_img);
  game.update({ ...trial, retries: 0 });

  game.status({
    retries: { total: CONF.num_retries, tried: game.state.retries },
    timeout: false,
  });
  schedule.run();
});

// game.on("otree.time.phase", function (event) {
//   const phase = event.detail;
//   console.debug("otree.time.phase", phase);
// });

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
    reaction: schedule.reaction_time(),
    retries: game.state.retries + 1,
  });

  decide();
});

game.on("otree.time.out", function () {
  console.debug("otree.time.out");
  game.freeze();

  // for no-go scenario
  //   game.update({
  //     response: CONF.nogo_response,
  //   });
  // decide();

  schedule.switch("final");

  if (game.state.feedback !== undefined) {
    // already has answered
    game.status({
      completed: true,
      success: game.state.feedback,
    });
  } else {
    // no answer so far
    game.status({
      completed: true,
      timeout: true,
    });
  }
});

async function decide() {
  let valid = validateTrial(game.state);

  game.update({
    feedback: valid,
  });

  game.status({
    retries: { total: CONF.num_retries, tried: game.state.retries },
  });

  if (!valid && game.state.retries < CONF.num_retries) {
    // continue round
    game.unfreeze();
  } else {
    // complete round
    schedule.switch("final");
    game.status({
      success: valid,
      completed: true,
    });
  }
}

game.on("otree.game.stop", async function (event) {
  const status = event.detail;
  console.debug("otree.game.stop", status);
  console.debug("completed:", status, game.state);
  schedule.cancel();
});

page.reset("status");
game.reset();

console.debug("playing:", CONF);

await page.wait("otree.page.start"); // for user to press 'start'

let progress = await game.iterateRounds(CONF, CONF.num_rounds, CONF.trial_pause);

game.reset();

schedule.switch("results");

console.debug("terminated:", progress);
