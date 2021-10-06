import { delay } from "../src/timers";

window.addEventListener("load", () => {
    const page = document.getElementsByTagName("otree-page")[0];

    page.addEventListener("otree-loaded", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-reset", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-display", (e) => {
        console.debug(e);
    });


    page.addEventListener("otree-updated", (e) => {
        console.debug(e);
        console.debug("update", e.detail.update);
    });

    // dumb single strial
    page.addEventListener("otree-updated", async (e) => {
        const u = e.detail.update;
        if (u.started === true && !('trial' in u)) {
            let trial = await generateTrial();
            delay(() => page.resetState({started: true, frozen: false, trial}));
            delay(() => page.display());
        }

        if ('response' in u) {
            let feedback = await validateResponse(page.state.trial, u.response);
            delay(() => page.setState({feedback}));
        }
    });

    page.resetState();
})
