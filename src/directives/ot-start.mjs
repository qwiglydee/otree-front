import { toggleDisplay, toggleDisabled, isDisabled } from "../utils";


export function install_otStart(root, page) {
    root.querySelectorAll("[data-ot-start]").forEach(elem => {
        const params = parse_trigger(elem);
        if (params.click) elem.addEventListener('click', (event) => handle_click(event, page, elem, params));
        if (params.touch) elem.addEventListener('touchend', (event) => handle_touch(event, page, elem, params));
        if (params.key) root.addEventListener('keydown', (event) => handle_key(event, page, elem, params)) ;
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
    toggleDisplay(elem, false);
    elem.disabled = true;
}


function handle_click(event, page, elem, params) {
    if (isDisabled(elem)) return;
    event.preventDefault();
    page.fire('start');
    disable(elem);
}

function handle_touch(event, page, elem, params) {
    if (isDisabled(elem)) return;
    event.preventDefault();
    page.fire('start');
    disable(elem);
}

function handle_key(event, page, elem, params) {
    if (isDisabled(elem)) return;
    if (event.code != params.key) return;
    event.preventDefault();
    page.fire('start');
    disable(elem);
}