import { jspath_parse } from "./utils";


export function install_otInput(root, page) {
    root.querySelectorAll("[data-ot-input]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.freeze', (event) => handle_freeze(event, elem));
        if (params.trigger.change) elem.addEventListener('change', (event) => handle_change(event, page, elem, params));
        if (params.trigger.click) elem.addEventListener('click', (event) => handle_click(event, page, elem, params));
        if (params.trigger.touch) elem.addEventListener('touchend', (event) => handle_touch(event, page, elem, params));
        if (params.trigger.key) root.addEventListener('keydown', (event) => handle_key(event, page, elem, params)) ;
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

function parse_params(elem) {
    const params = {}
    params.trigger = parse_trigger(elem);

    const match = elem.dataset.otInput.match(/^([\w.]+)(=(.+))?$/);
    if (!match) throw new Error(`Invalid expression for input: ${elem.dataset.otInput}`);

    let path = jspath_parse(match[1]);
    if (path.length != 1) throw new Error('Nested input var not supported yet');
    params.field = path[0];

    let val = match[3];
    if (val === "true") val = true;
    if (val === "false") val = false;
    params.val = val;

    const tag = elem.tagName;

    if (tag == 'BUTTON') {
        params.trigger.click = true;
        if (val === undefined) throw new Error(`Button require input value: ${elem.dataset.otInput}`);
    }
    else if (tag == 'INPUT' || tag == 'SELECT' || tag == 'TEXTAREA') {
        params.trigger.change = true;
        if (val !== undefined) throw new Error(`Built-in input cant use value: ${elem.dataset.otInput}`);
    }
    else {
        if (val === undefined) throw new Error(`Custom input requires input value: ${elem.dataset.otInput}`);
    }

    return params;
}



function toggle_disabled(elem, disabled) {
    elem.disabled = disabled;
    elem.classList.toggle('ot-disabled', disabled);
}


function handle_freeze(event, elem) {
    const { frozen } = event.detail;
    toggle_disabled(elem, frozen);
}

function handle_change(event, page, elem, params) {
    let value = elem.value;
    if (value === "true") val = true;
    if (value === "false") val = false;
    page.response({ [params.field]: value });
}

function handle_click(event, page, elem, params) {
    event.preventDefault();
    page.response({ [params.field]: params.val });
}

function handle_touch(event, page, elem, params) {
    event.preventDefault();
    page.response({ [params.field]: params.val });
}

function handle_key(event, page, elem, params) {
    if (event.code != params.trigger.key) return;
    event.preventDefault();
    page.response({ [params.field]: params.val });
}