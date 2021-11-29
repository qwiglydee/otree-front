import { utils } from "../src";
import { Page, Schedule, Game, iterateRounds } from "../src";

import { generateTrial, validateTrial } from "./trials_data.js";

const CONF = {
  num_retries: 3
}

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

page.on("otree.game.start", async function (event, status) {
  console.debug("otree.game.start", status);

  let trial = generateTrial(game.conf.iteration);
  trial.stimulus_img = await utils.dom.loadImage(trial.stimulus_img);

  game.update(trial);
  game.update({ retries: 0 });

  schedule.run();
});

page.on("otree.page.response", function (event, input) {
  console.debug("otree.page.response", input, schedule.reaction_time());

  game.freeze();

  let response = input.response;

  game.update({ response, retries: game.state.retries + 1 });

  let feedback = validateTrial(game.state);

  game.update({ feedback });

  if (feedback) {
    game.stop({ success: feedback });
  } else if (game.state.retries == CONF.num_retries) {
    game.stop({});
  } else {
    // continue round
    game.unfreeze();
  }
});

page.on("otree.time.out", function () {
  console.debug("otree.time.out");
  game.freeze();

  if (game.state.feedback !== undefined) { // already has answered
    game.stop({ success: game.state.feedback });
  } else {
    game.update({ timeout: true });
    game.stop({ timeout: true });
  }
});

page.on("otree.game.stop", async function (event, status) {
  console.debug("otree.game.stop", status);
  schedule.switch("final");
  schedule.cancel();
});

page.on("otree.game.reset", async function (event, detail) {
  console.debug("otree.game.reset", setail);
});

page.on("otree.time.phase", async function (event, phase) {
  console.debug("otree.time.phase", phase);
});

page.on("otree.page.update", async function (event, changes) {
  console.debug("otree.page.update", changes);
});


// main

game.reset();

await page.wait("otree.page.start"); // for user to press 'start'

await iterateRounds(game, CONF, 3, 3000);

schedule.switch("results");
