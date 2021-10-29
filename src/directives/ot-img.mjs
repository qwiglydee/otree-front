import { JSPath } from "../jspath";

import { setChild } from "../utils";


export function install_otImg(root) {
    root.querySelectorAll("[data-ot-img]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.update', (event) => handle_update(event, elem, params));
    });
}


function parse_params(elem) {
    return { ref: new JSPath(elem.dataset.otImg) };
}

function eval_img(params, changes) {
    let img = params.ref.extract(changes);
    if (!!img && !(img instanceof Image)) {
        throw new Error(`Invalid value for image: ${img}`);
    }
    return img;
  }

function handle_reset(event, elem, params) {
    setChild(elem, null);
}

function handle_update(event, elem, params) {
    const { changes } = event.detail;
    setChild(elem, eval_img(params, changes));
}