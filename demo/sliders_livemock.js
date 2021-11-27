import { delay, cancel } from "../src/utils/timers";
import { generatePuzzle, validateSlider, validatePuzzle } from "./sliders_data";

function mockrecv(message) {
  // console.debug("mock live recv", message);
  window.liveRecv(message);
} 
window.liveSend = mocksend;


const CONF = {
  num_sliders: 8,
  max_moves: 8 * 5     
}

let puzzle;
let stats;


function mocksend(message) {
  // console.debug("live", message);
  switch (message.type) {
    case "start":
      mockrecv({ type: "setup", ...CONF });
      break;

    case "load":
      puzzle = generatePuzzle(CONF.num_sliders);
      stats = { moves: 0, errors: 0, solved: 0 };
      mockrecv({ type: "game", ...puzzle });
      mockrecv({ type: "status", stats });
      delay(otherplayer, Math.random() * 5000 + 5000);
      break;

    case "response":
      let { slider: idx, input } = message;
      let { valid, value, correct } = validateSlider(puzzle.sliders[idx], input);

      let update = {
        [`sliders.${idx}.value`]: value,
        [`sliders.${idx}.correct`]: correct,
        [`sliders.${idx}.valid`]: valid,
      };

      mockrecv({ type: "update", ...update });

      stats.moves ++;

      if (!valid || !correct ) stats.errors ++;

      if (valid) {
        puzzle.sliders[idx].value = value;
        puzzle.sliders[idx].correct = correct;
      }

      stats.solved = validatePuzzle(puzzle);
      let success = stats.solved == CONF.num_sliders
      let completed = success || stats.moves == CONF.max_moves;

      mockrecv({ type: "status", completed, success, stats });

      if (completed) cancel(otherplayertimer);
  }
};


let otherplayertimer;
function otherplayer() {
  let idx = Math.floor(Math.random()*puzzle.sliders.length);
  let input = Math.floor(Math.random() * 50 - 25) * 4 + puzzle.sliders[idx].target;
  mocksend({ type: 'response', slider: idx, input: input});

  otherplayertimer = delay(otherplayer, Math.random() * 5000 + 1000);
}

