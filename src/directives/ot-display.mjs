import { onPage } from "../utils/events";
import { toggleDisplay } from "../utils/dom";

export function otDisplay(page) {
    page.body.querySelectorAll("[data-ot-display]").forEach(elem => {
        const params = parse_params(elem);
        onPage(page, elem, params, 'otree.reset', handle_reset);
        onPage(page, elem, params, 'otree.phase', handle_phase);
    });
}

function parse_params(elem) {
    const match = elem.dataset.otDisplay.match(/^\w+$/);
    if (!match) throw new Error(`Invalid display phase: ${elem.dataset.otDisplay}`);

    return {
        phase: elem.dataset.otDisplay
    };
}

function handle_reset(page, target, params, event) {
    toggleDisplay(target, false);
}

function handle_phase(page, target, params, event) {
    toggleDisplay(target, event.detail.display == params.phase);
}