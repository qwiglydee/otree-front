import { utils } from "../src/";

const { delay, cancel } = utils.timers;

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
let progress;


function mocksend(message) {
  // console.debug("live", message);
  switch (message.type) {
    case "start":
      mockrecv({ type: "setup", setup : CONF, status: { progress } });
      break;

    case "load":
      puzzle = generatePuzzle(CONF.num_sliders);
      progress = { moves: 0, errors: 0, solved: 0 };
      mockrecv({ type: "game", game: { sliders: puzzle }, status: { progress }});
      // delay(otherplayer, Math.random() * 5000 + 5000);
      break;

    case "response":
      let { slider: idx, input } = message;
      let { valid, value, correct } = validateSlider(puzzle[idx], input);

      let update = {
        [`sliders.${idx}.value`]: value,
        [`sliders.${idx}.correct`]: correct,
        [`sliders.${idx}.valid`]: valid,
      };

      progress.moves ++;

      if (!valid || !correct ) progress.errors ++;

      if (valid) {
        puzzle[idx].value = value;
        puzzle[idx].correct = correct;
      }

      progress.solved = validatePuzzle(puzzle);
      let success = progress.solved == CONF.num_sliders
      let completed = success || progress.moves == CONF.max_moves;

      if (completed) cancel(otherplayertimer);

      mockrecv({ type: "update", update, status: { completed, success, progress }});
    }
};


let otherplayertimer;
function otherplayer() {
  let idx = Math.floor(Math.random()*puzzle.length);
  let input = Math.floor(Math.random() * 50 - 25) * 4 + puzzle[idx].target;
  mocksend({ type: 'response', slider: idx, input: input});

  otherplayertimer = delay(otherplayer, Math.random() * 5000 + 1000);
}

