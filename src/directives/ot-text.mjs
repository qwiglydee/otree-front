import { jspath_extract, jspath_parse, toggle_display } from "../utils";


export function install_otText(root) {
    root.querySelectorAll("[data-ot-text]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.update', (event) => handle_update(event, elem, params));
    });
}


function parse_params(elem) {
    let path = jspath_parse(elem.dataset.otText);
    return { path };
}

function eval_text(params, state) {
    let _var = jspath_extract(params.path, state);
    if (_var === undefined) return "";
    return _var.toString();
}

function set_text(elem, text) {
    elem.textContent = text;
}

function handle_reset(event, elem, params) {
    const { page } = event.detail;
    set_text(elem, eval_text(params, page.state));
}

function handle_update(event, elem, params) {
    const { page, changes } = event.detail;
    if (!(params.path[0] in changes)) return;
    set_text(elem, eval_text(params, page.state));
}