import { utils } from "../src";
import { iterateRounds } from "../src";

import { generateTrial, validateTrial } from "./trials_data.js";

const CONF = {
  num_retries: 3,
  num_iterarions: 10,
  iteration_pause: 1000,
};

const PHASES = [
  { time: 0, display: "aim" },
  { time: 500, display: "prime" },
  { time: 1000, display: "target", input: true, timeout: 5000 },
  { time: 2000, display: "question" },
];


window.onload = async function main() {
  console.debug("global page:", page);
  console.debug("global game:", game);


  page.on("otree.game.start", async function (event, status) {
    console.debug("otree.game.start", status);

    let trial = generateTrial(game.conf.iteration);
    trial.stimulus_img = await utils.dom.loadImage(trial.stimulus_img);

    game.update(trial);
    game.update({ retries: 0 });

    performance.clearMarks();
    performance.clearMeasures();
    schedule.run(PHASES);
  });

  page.on("otree.time.phase", (event, phase) => {
    if (phase.input) {
      performance.mark("input");
    }
  });

  page.on("otree.page.response", function (event, input) {
    console.debug("otree.page.response", input);

    performance.mark("response");
    performance.measure("reaction_time", "input", "response");
    let measure = performance.getEntriesByName("reaction_time").pop();
    console.debug("reaction:", measure.duration);

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

    if (game.state.feedback !== undefined) {
      // already has answered
      game.stop({ success: game.state.feedback });
    } else {
      game.update({ timeout: true });
      game.stop({ timeout: true });
    }
  });

  page.on("otree.game.stop", async function (event, status) {
    console.debug("otree.game.stop", status);
    schedule.cancel();
    page.toggle({display: 'target'});
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

  game.reset();
  page.toggle({ display: null, input: false});

  await page.wait("otree.page.start");

  await iterateRounds(game, CONF, CONF.num_iterations, CONF.iteration_pause);

  page.toggle({ display: "results" });
}
