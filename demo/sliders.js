import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Game } from "../src/game.mjs";
import { Ref } from "../src/utils/changes.mjs";

import { generatePuzzle, validateSlider, validatePuzzle } from "./sliders_data.js";
import "./sliders_directive.js";

const page = new Page();
const game = new Game(page);

game.on("otree.game.start", async function (event) {
  const conf = event.detail;
  console.debug("otree.game.start", conf);
  const puzzle = generatePuzzle();

  // need to load all images into Image objects

  for (let i = 0; i < 9; i++) {
    puzzle.sliders[i].background = await loadImage(puzzle.sliders[i].background);
    puzzle.sliders[i].idx = i; // for backref
  }

  game.update(puzzle);
});

game.on("otree.page.response", function (event) {
  let { slideref, value } = event.detail;
  console.debug("otree.page.response", response);
  game.freeze();

  slideref = slideref.slice(5); // strip 'game.' prefix

  game.update({
    [slideref + ".value"]: value,
    [slideref + ".valid"]: false,
  });

  validate(slideref);
});

function validate(slideref) {
  const slider = Ref.extract(game.state, slideref);
  const { value, valid } = validateSlider(slider);

  game.update({
    [slideref + ".value"]: value,
    [slideref + ".valid"]: valid,
  });

  const completed = validatePuzzle(puzzle);
  if (completed) {
    game.status({
      completed: true,
      success: true,
    });
  }
}

page.reset("status");
game.reset();

page.fire("otree.page.start");
//await page.wait("otree.page.start"); // for user to press 'start'

let status = await game.playRound({});

console.debug("completed:", status);
