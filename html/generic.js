import { Page } from "../src/page";
import { GenericGame } from "../src/game";
import { DemoData } from "./generic_data";

const page = new Page();
const data = new DemoData();
const game = new GenericGame(data, page, {
    inputDelay: 1502,
    inputTimeout: 5000,
    trialPause: 1000
});

data.init();
page.init();
page.start(); // FIXME: handle by data-ot-start
game.start();
