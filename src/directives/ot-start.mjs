import { onPage, onTarget } from "../utils/events";
import { toggleDisplay, toggleDisabled, isDisabled } from "../utils/dom";

export function otStart(page) {
    page.body.querySelectorAll("[data-ot-start]").forEach(elem => {
        const params = parse_trigger(elem);
        if (params.click) onTarget(page, elem, params, 'click', handle_click);
        if (params.touch) onTarget(page, elem, params, 'touchend', handle_touch);
        if (params.key) onPage(page, elem, params, 'keydown', handle_key);
    });
}

function parse_trigger(elem) {
    return {
        click: 'otClick' in elem.dataset,
        touch: 'otTouch' in elem.dataset,
        key: 'otKey' in elem.dataset ? elem.dataset.otKey : false,
    };
}

function disable(elem) {
    // TODO: detach handlers
    toggleDisplay(elem, false);
    elem.disabled = true;
}


function handle_click(page, target, params, event) {
    if (isDisabled(target)) return;
    event.preventDefault();
    page.start();
    disable(target);
}

function handle_touch(page, target, params, event) {
    if (isDisabled(target)) return;
    event.preventDefault();
    page.start();
    disable(target);
}

function handle_key(page, target, params, event) {
    if (isDisabled(target)) return;
    if (event.code != params.key) return;
    event.preventDefault();
    page.start();
    disable(target);
}