import {jspath_parse, toggle_disabled} from "./utils";


export function install_otInput(root, page) {
    root.querySelectorAll("input[data-ot-input], select[data-ot-input], textarea[data-ot-input]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.freeze', (event) => handle_freeze(event, elem));
        elem.addEventListener('change', (event) => handle_change(event, page, elem, params));
    });
    root.querySelectorAll("button[data-ot-input]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.freeze', (event) => handle_freeze(event, elem));
        elem.addEventListener('click', (event) => handle_click(event, page, elem, params));
    });
}


function parse_params(elem) {
    const match = elem.dataset.otInput.match(/^([\w.]+)(=(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${elem.dataset.otWhen}`);
    let path = jspath_parse(match[1]);
    if (path.length != 1) throw new Error('Nested input var not supported yet');
    let val = match[3];
    if (val === undefined && elem.tagName == 'BUTTON') throw new Error('Buttons require input values');
    if (val !== undefined && elem.tagName != 'BUTTON') throw new Error('Inputs use native value');
    if (val === "true") val = true;
    if (val === "false") val = false;
    return {key: path[0], val};
}


function handle_freeze(event, elem) {
    const { frozen } = event.detail;
    toggle_disabled(elem, frozen);
}

function handle_change(event, page, elem, params) {
    let value = elem.value;
    if (value === "true") val = true;
    if (value === "false") val = false;
    page.response({[params.key]: value});
}

function handle_click(event, page, elem, params) {
    event.preventDefault();
    page.response({[params.key]: params.val});
}