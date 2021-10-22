import { toggle_display } from "./utils";


export function install_otStart(root, page) {
    root.querySelectorAll("[data-ot-start]").forEach(elem => {
        const params = parse_trigger(elem);
        root.addEventListener('ot.start', (event) => handle_start(event, elem));
        if (params.click) elem.addEventListener('click', (event) => handle_click(event, page, elem, params));
        if (params.touch) elem.addEventListener('touchend', (event) => handle_touch(event, page, elem, params));
        if (params.key) root.addEventListener('keydown', (event) => handle_key(event, page, elem, params)) ;
    });
}

function parse_trigger(elem) {
    return {
        click: 'otClick' in elem.dataset,
        touch: 'otTouch' in elem.dataset,
        key: elem.dataset.otKey,
        change: false
    };
}

function handle_start(event, elem) {
    toggle_display(elem, false);
    elem.disabled = true;
}


function handle_click(event, page, elem, params) {
    if (elem.disabled) return;
    event.preventDefault();
    page.start();
}

function handle_touch(event, page, elem, params) {
    if (elem.disabled) return;
    event.preventDefault();
    page.start();
}

function handle_key(event, page, elem, params) {
    if (elem.disabled) return;
    if (event.code != params.key) return;
    event.preventDefault();
    page.start();
}