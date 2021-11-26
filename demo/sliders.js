import { loadImage } from "../src/utils/dom.mjs";

import { Page } from "../src/page.mjs";
import { Live } from "../src/live.mjs";
import { Game } from "../src/game.mjs";
import { Ref, Changes } from "../src/utils/changes.mjs";


let conf = null;
const page = new Page();
const live = new Live(page);
const game = new Game(page);

game.on("otree.game.start", async function (event) {
  console.debug("otree.game.start", event.detail);
  live.send('load');
});

game.on("otree.live.game", async function(event) {
  console.debug("otree.live.game", event.detail);
  const { puzzle } = event.detail;

  // need to load all images into Image objects

  for (let i = 0; i < conf.num_sliders; i++) {
    puzzle.sliders[i].background = await loadImage(puzzle.sliders[i].background);
    puzzle.sliders[i].idx = i; // for backref
    puzzle.sliders[i].valid = true; // not part of the server state
  }

  game.update({sliders: puzzle.sliders});
});

game.on("otree.page.response", function (event) {
  console.debug("otree.page.response", event.detail);
  let { slider: ref, value } = event.detail;

  ref = ref.slice(5); // strip 'game.' prefix

  game.update({
    [ref + ".value"]: value,
    [ref + ".valid"]: false,
  });

  let idx = Ref.extract(game.state, ref + ".idx");
  live.send('response', { slider: idx, input: value });
});

game.on('otree.live.update', function(event) { 
  console.debug("otree.live.update", event.detail);
  const { update } = event.detail;
  game.update(update);
});

game.on('otree.live.status', function(event) { 
  console.debug("otree.live.status", event.detail);
  const status = event.detail;

  if ('conf' in status) {
    conf = status.conf; 
    this.page.update(new Changes(conf, "conf"));
    return;
  }

  game.status(status);
});


page.reset("status");
game.reset();

live.send('start');

page.fire('otree.time.phase', {display: null});
// page.fire("otree.page.start");
await page.wait("otree.page.start"); // for user to press 'start'

let status = await game.playRound({});

page.fire('otree.time.phase', {display: "final"});

console.debug("completed:", status);
