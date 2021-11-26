import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Schedule } from "../src/utils/schedule.mjs";
import { Game } from "../src/game.mjs";

import { generateTrial, validateTrial } from "./trials_data.js";

const CONF = {
  num_rounds: 5,
  num_retries: 3,
  nogo_response: "skipped",
  trial_pause: 1000,
};

const page = new Page();

const schedule = new Schedule(page, [
  { time: 0, display: "aim" },
  { time: 1000, display: "prime" },
  { time: 1500, display: "target" },
  { time: 1500, input: true, timeout: 3000 },
  { name: "final", display: "final" } // the phase to show during final waiting and intertrial pause
]);

const game = new Game(page);

game.on("otree.game.start", async function (event) {
  const conf = event.detail;
  console.debug("otree.game.start", conf);
  const trial = generateTrial(conf.iteration);
  trial.stimulus_img = await loadImage(trial.stimulus_img);
  game.update(trial); 
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
  });
  decide();
});

game.on("otree.time.out", function () {
  console.debug("otree.time.out");
  game.freeze();
  if (game.state.response === undefined) { // skip if already given    
    game.update({
      response: CONF.nogo_response,
    });
  }
  decide();
});

async function decide() {
  let valid = validateTrial(game.state);
  game.update({
    feedback: valid,
  });

  game.status({
    success: valid,
    completed: true,
  });
}

game.on("otree.game.stop", async function (event) {
  const status = event.detail;
  console.debug("otree.game.stop", status);
  console.debug("completed:", status, game.state);
  schedule.cancel();
});


game.reset();

console.debug("playing:", CONF);

await page.wait("otree.page.start"); // for user to press 'start'

// let status = await game.playRound(CONF); // single round
let progress = await game.iterateRounds(CONF, CONF.num_rounds, CONF.trial_pause);

game.reset();

console.debug("terminated:", progress);
