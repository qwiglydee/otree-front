const page = document.getElementsByTagName("otree-page")[0];

window.addEventListener("load", () => {
    page.addEventListener("otree-start", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-trial-start", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-response", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-trial-responded", (e) => {
        console.debug(e);
    });

    page.addEventListener("otree-trial-feedback", (e) => {
        console.debug(e);
    });
})
