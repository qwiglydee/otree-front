import { jspath_extract, jspath_parse, toggle_display } from "./utils";


export function install_otImg(root) {
    root.querySelectorAll("[data-ot-img]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.update', (event) => handle_update(event, elem, params));
    });
}


function parse_params(elem) {
    let path = jspath_parse(elem.dataset.otImg);
    return { path };
}

function eval_img(params, state) {
    let _var = jspath_extract(params.path, state);
    return _var;
}

function set_img(elem, img) {
    if (img === undefined) {
        elem.replaceChildren();
    } else if (!(img instanceof Image)) {
        throw new Error(`Invalid value for image`);
    } else {
        elem.replaceChildren(img);
    }
}

function handle_reset(event, elem, params) {
    const { page } = event.detail;
    set_img(elem, eval_img(params, page.state));
}

function handle_update(event, elem, params) {
    const { page, changes } = event.detail;
    if (!(params.path[0] in changes)) return;
    set_img(elem, eval_img(params, page.state));
}