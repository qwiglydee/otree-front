import {jspath_extract, jspath_parse, toggle_display} from "./utils";


export function install_otImg(root) {
    root.querySelectorAll("[data-ot-img]").forEach(elem => {
        root.addEventListener('ot.reset', handler_reset(elem));
        root.addEventListener('ot.update', handler_update(elem));
    });
}


function parse_params(elem) {
    let path = jspath_parse(elem.dataset.otImg);
    return {path};
}

function eval_img(params, state) {
    let _var = jspath_extract(params.path, state);
    return _var;
}

function set_img(elem, img) {
    elem.replaceChildren(img);
}

function handler_reset(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page } = event.detail;
        set_img(elem, eval_img(params, page.state));
    }
}

function handler_update(elem) {
    const params = parse_params(elem);
    return function(event) {
        const { page, changes } = event.detail;
        if (!(params.path[0] in changes)) return;
        set_img(elem, eval_img(params, page.state));
    }
}