import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./posner_data";
import { toggle_display } from "../src/utils";

const page = new Page();
const data = new DemoData();
const game = new GenericGame(
  data,
  page,
  {
    trialTimeout: 3000,
    trialPause: 1000,
    numIterations: 5,
  },
  [
    { display: "aim", duration: 1000 },
    { display: "cue", duration: 500 },
    { display: "pause", duration: 50 },
    { display: "target", input: true },
  ]
);

data.init();
page.init();
page.reset();
page.root.addEventListener('ot.start', async () => {
  try {
    let result = await game.run();
    console.debug("ENDED", result);
  } catch (e) {
    console.debug("FAILED", e);
  } finally {
    toggle_display(page.root, false);
  }
});
