import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./nback_data";
import { toggle_display } from "../src/utils";

const
const data = new DemoData({
  n: 2,
  length: 15,
  chars: "ABCD"
});
const game = new GenericGame(
  data,
  page,
  {
    trialTimeout: 3000,
    numIterations: 15,
    gameTimeout: 60000,
    responseComplete: false,
    progress: 'trial'
  },
  [
    { display: "stimulus", duration: 500 },
    { display: null, input: true },
  ]
);

data.init();
console.debug("sequence:", data.sequence);

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
