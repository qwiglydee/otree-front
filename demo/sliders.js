import { utils } from "../src";
import { Page, Live, Game, playRound } from "../src";
const Ref = utils.changes.Ref;

const page = new Page();
const live = new Live(page);
const game = new Game(page);

page.on("otree.game.start", async function(event, status) {
  console.debug("otree.game.start", status);
  live.send("load"); // → live.game
});

page.on("otree.live.game", async function(event, puzzle) {
  console.debug("otree.live.game", puzzle);

  // need to load all images into Image objects
  for (let i = 0; i < game.conf.num_sliders; i++) {
    puzzle.sliders[i].background = await utils.dom.loadImage(puzzle.sliders[i].background);
    puzzle.sliders[i].idx = i;
    puzzle.sliders[i].valid = true;
  }

  game.update(puzzle);
});

page.on("otree.page.response", function (event, input) {
  console.debug("otree.page.response", input);
  let { slider: ref, value } = input;

  ref = Ref.strip("game", ref); // FIXME: ugly hack

  game.update({
    [ref + ".value"]: value,
    [ref + ".valid"]: false,
  });

  let idx = Ref.extract(game.state, ref + ".idx");

  live.send('response', { slider: idx, input: value }); // → live.update, live.status
});

page.on('otree.live.update', function(event, update) { 
  console.debug("otree.live.update", update);
  game.update(update);
});

page.on('otree.live.status', function(event, status) { 
  console.debug("otree.live.status", status);

  if ('stats' in status) {
    page.update({ progress: status.stats });
  }

  if (status.completed) {
    page.update({ status }); // to indicate lost/won results 
    game.stop(status);
  }

});

// main

game.reset();

live.send('start');
await page.wait("otree.live.setup").then(event => {
  const conf = event.detail; 
  console.debug("otree.live.setup", conf);
  game.reset(conf);
});

page.toggle({display: null});

await page.wait("otree.page.start"); // for user to press 'start'

await playRound(game, game.conf);

page.toggle({display: "final"});