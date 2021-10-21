import {jspath_extract, jspath_parse} from "./utils";


export function install_otClass(root) {
    root.querySelectorAll("[data-ot-class]").forEach(elem => {
        root.addEventListener('ot.reset', handler_reset(elem));
        root.addEventListener('ot.update', handler_update(elem));
    });
}


function parse_params(elem) {
    let path = jspath_parse(elem.dataset.otClass);
    let defaults = Array.from(elem.classList);
    return {path, defaults};
}

function eval_class(params, state) {
    let _var = jspath_extract(params.path, state);
    return _var;
}

function set_class(elem, defaults, cls) {
    elem.classList.remove(...elem.classList);
    elem.classList.add(...defaults);
    if (cls !== undefined) {
        elem.classList.add(cls);
    }
}

function handler_reset(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page } = event.detail;
        set_class(elem, params.defaults, eval_class(params, page.state));
    }
}

function handler_update(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page, changes } = event.detail;
        if (!(params.path[0] in changes)) return;
        set_class(elem, params.defaults, eval_class(params, page.state));
    }
}