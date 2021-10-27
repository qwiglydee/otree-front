import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./flanker_data";
import { toggle_display } from "../src/utils";

const page = new Page();
const data = new DemoData({chars: {left: "XC", right: "VB" }});
const game = new GenericGame(
  data,
  page,
  {
    trialTimeout: 3000,
    trialPause: 100,
    numIterations: 15,
    responseComplete: true,
    progress: 'trial'
  },
  [
    { display: "stimulus", duration: 3000, input: true },
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
