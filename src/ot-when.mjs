import {jspath_extract, jspath_parse, toggle_display} from "./utils";


export function install_otWhen(root) {
    root.querySelectorAll("[data-ot-when]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.update', (event) => handle_update(event, elem, params));
    });
}


function parse_params(elem) {
    const match = elem.dataset.otWhen.match(/^([\w.]+)(==(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${elem.dataset.otWhen}`);
    let path = jspath_parse(match[1]);
    let val = match[3];
    if (val === "true") val = true;
    if (val === "false") val = false;
    return {path, val};
}


function eval_condition(params, state) {
    let _var = jspath_extract(params.path, state);
    if (_var === undefined) return false; // var field is unset
    if (params.val === undefined) { // "var" form
        return !!_var;  // any non-false
    } else { // "var==val" form
        return _var == params.val; // non-strict eq here, so that numbers work
    }
}

function handle_reset(event, elem, params) {
    const { page } = event.detail;
    const enabled = eval_condition(params, page.state);
    toggle_display(elem, enabled);
}

function handle_update(event, elem, params) {
    const { page, changes } = event.detail;
    if (!(params.path[0] in changes)) return;
    const enabled = eval_condition(params, page.state);
    toggle_display(elem, enabled);
}