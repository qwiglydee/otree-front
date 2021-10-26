import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./generic_data";
import { toggle_display } from "../src/utils";

const page = new Page();
const data = new DemoData();
const game = new GenericGame(data, page, {
    inputDelay: 1502,
    inputTimeout: 5000,
    trialPause: 1000,
    numIterations: 5,
    gameTimeout: 25000
});

data.init();
page.init();
page.start(); // FIXME: handle by data-ot-start

try {
    let result = await game.run();
    console.debug("ENDED", result);
} catch(e) {
    console.debug("FAILED", e);
} finally {
    toggle_display(page.root, false);
}
