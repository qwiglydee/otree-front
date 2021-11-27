import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Live } from "../src/live.mjs";
import { Game } from "../src/game.mjs";
import { Ref, Changes } from "../src/utils/changes.mjs";


let conf = null;
const page = new Page();
const live = new Live(page);
const game = new Game(page);

page.on("otree.game.start", async function (event, conf) {
  console.debug("otree.game.start", conf);
  live.send('load');
});

page.on("otree.live.game", async function(event, puzzle) {
  console.debug("otree.live.game", puzzle);

  // need to load all images into Image objects

  for (let i = 0; i < conf.num_sliders; i++) {
    puzzle.sliders[i].background = await loadImage(puzzle.sliders[i].background);
    puzzle.sliders[i].idx = i; // for backref
    puzzle.sliders[i].valid = true; // not part of the server state
  }

  game.update({sliders: puzzle.sliders});
});

page.on("otree.page.response", function (event, input) {
  console.debug("otree.page.response", input);
  let { slider: ref, value } = input;

  ref = ref.slice(5); // strip 'game.' prefix

  game.update({
    [ref + ".value"]: value,
    [ref + ".valid"]: false,
  });

  let idx = Ref.extract(game.state, ref + ".idx");
  live.send('response', { slider: idx, input: value });
});

page.on('otree.live.update', function(event, update) { 
  console.debug("otree.live.update", update);
  game.update(update);
});

page.on('otree.live.status', function(event, status) { 
  console.debug("otree.live.status", status);
  game.status(status);
});


page.reset("status");
game.reset();

live.send('start');
await page.wait("otree.live.setup").then(event => { 
  console.debug("otree.live.setup", event.detail);
  conf = event.detail;
  page.update({ conf }); 
});

page.toggle({display: null});
// page.fire("otree.page.start");
await page.wait("otree.page.start"); // for user to press 'start'

let status = await game.playRound({});

page.toggle({display: "final"});

console.debug("completed:", status);
