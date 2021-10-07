import { GenericGame } from "../src/game-generic";
import { MockData } from "./mockdata";

// TODO: handle page reload

window.addEventListener("load", () => {
    const page = document.getElementsByTagName("otree-page")[0];
    const data = new MockData();
    const game = new GenericGame(data, page, {
        trialDelay: 2000, // pause after trial
        inputDelay: 1500  // time to unfreeze inputs
    });

    game.init();

    page.addEventListener("otree-loaded", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-reset", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-display", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-freeze", (e) => {
        console.debug(e, "freeze:", e.detail.frozen);
    });

    page.addEventListener("otree-updated", (e) => {
        console.debug(e, "update:", e.detail.update);
    });

    page.resetState({started: false});
})
