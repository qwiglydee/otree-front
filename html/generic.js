import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./generic_data";
import { toggle_display } from "../src/utils";

const
const data = new DemoData();
const game = new GenericGame(
  data,
  page,
  {
    trialTimeout: 5000,
    trialPause: 1000,
    numIterations: 5,
    gameTimeout: 60000,
    progress: 'response'
  },
  [
    { display: "aim", duration: 1000 },
    { display: "prime", duration: 500 },
    { display: "pause", duration: 500 },
    { display: "target", input: true },
  ]
);

data.init();

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
