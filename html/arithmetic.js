import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./arithmetic_data";
import { toggle_display } from "../src/utils";

const
const data = new DemoData();
const game = new GenericGame(
  data,
  page,
  {
    trialPause: 1000,
    numIterations: 10,
    responseField: 'answer',
    progress: 'response',
  },
  [
      {display: 'puzzle', input: true}
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
