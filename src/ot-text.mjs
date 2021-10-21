import {jspath_extract, jspath_parse, toggle_display} from "./utils";


export function install_otText(root) {
    root.querySelectorAll("[data-ot-text]").forEach(elem => {
        root.addEventListener('ot.reset', handler_reset(elem));
        root.addEventListener('ot.update', handler_update(elem));
    });
}


function parse_params(elem) {
    const match = elem.dataset.otText.match(/^(\w+(\.\w+)*)$/);
    // TODO: throw syntax error
    let path = jspath_parse(match[1]);
    return {path};
}

function eval_text(params, state) {
    let _var = jspath_extract(params.path, state);
    if (_var === undefined) return "";
    return _var.toString();
}

function set_text(elem, text) {
    elem.textContent = text;
}

function handler_reset(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page } = event.detail;
        set_text(elem, eval_text(params, page.state));
    }
}

function handler_update(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page, changes } = event.detail;
        if (!(params.path[0] in changes)) return;
        set_text(elem, eval_text(params, page.state));
    }
}