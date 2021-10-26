import { toggle_display } from "../utils";


export function install_otDisplay(root) {
    root.querySelectorAll("[data-ot-display]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.display', (event) => handle_display(event, elem, params));
    });
}


function parse_params(elem) {
    const match = elem.dataset.otDisplay.match(/^\w+$/);
    if (!match) throw new Error(`Invalid display phase: ${elem.dataset.otDisplay}`);

    return {
        phase: elem.dataset.otDisplay
    };
}

function handle_reset(event, elem, params) {
    toggle_display(elem, false);
}

function handle_display(event, elem, params) {
    toggle_display(elem, event.detail.phase == params.phase);
}