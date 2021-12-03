import { utils } from "../src";

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

  game.onStart = async function (params) {
    console.debug("start", params);

    let trial = generateTrial(params.iteration);
    trial.stimulus_img = await utils.dom.loadImage(trial.stimulus_img);

    game.update(trial);
    game.update({ retries: 0 });

    performance.clearMarks();
    performance.clearMeasures();
    schedule.run(PHASES);
  };

  game.onPhase = function(phase) {
    if (phase.input) {
      performance.mark("input");
    }
  };

  game.onInput = function (input) {
    console.debug("input", input);

    performance.mark("response");
    performance.measure("reaction_time", "input", "response");
    let measure = performance.getEntriesByName("reaction_time").pop();
    console.debug("reaction:", measure.duration);

    page.freeze();

    let response = input.response;

    game.update({ response, retries: game.state.retries + 1 });

    let feedback = validateTrial(game.state);

    game.update({ feedback });

    if (feedback) {
      game.complete({ success: feedback });
    } else if (game.state.retries == CONF.num_retries) {
      game.complete({});
    } else {
      // continue round
      page.unfreeze();
    }
  };

  game.onTimeout = function () {
    page.freeze();

    if (game.state.feedback !== undefined) {
      // already has answered
      game.complete({ success: game.state.feedback });
    } else {
      game.update({ timeout: true });
      game.complete({ timeout: true });
    }
  };

  game.onComplete = function (result) {
    console.debug("completed", result);
    schedule.cancel();
    page.toggle({display: 'target'});
  };

  game.reset();
  page.toggle({ display: null, input: false});

  await page.wait("ot.ready");

  await game.playIterations(CONF.num_iterations, CONF.iteration_pause);

  page.toggle({ display: "results" });
}
