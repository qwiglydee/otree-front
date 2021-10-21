import {jspath_extract, jspath_parse, toggle_display} from "./utils";


export function install_otWhen(root) {
    root.querySelectorAll("[data-ot-when]").forEach(elem => {
        root.addEventListener('ot.reset', handler_reset(elem));
        root.addEventListener('ot.update', handler_update(elem));
    });
}


function parse_params(elem) {
    const when_match = elem.dataset.otWhen.match(/^(\w+(\.\w+)*)(==(.+))?$/);
    // TODO: throw syntax error
    let path = jspath_parse(when_match[1]);
    let val = when_match[4];
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

function handler_reset(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page } = event.detail;
        const enabled = eval_condition(params, page.state);
        toggle_display(elem, enabled);
    }
}

function handler_update(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page, changes } = event.detail;
        if (!(params.path[0] in changes)) return;
        const enabled = eval_condition(params, page.state);
        toggle_display(elem, enabled);
    }
}