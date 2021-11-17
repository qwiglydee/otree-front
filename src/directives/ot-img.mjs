import { Ref } from "../utils/changes";
import { setChild } from "../utils/dom";

export function install_otImg(root) {
  root.querySelectorAll("[data-ot-img]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
  });
}

function parse_params(elem) {
  let ref = elem.dataset.otImg;
  Ref.validate(ref);
  return { ref };
}

function eval_img(params, changes) {
  let img = changes.pick(params.ref);
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
  if (changes.affects(params.ref)) {
    setChild(elem, eval_img(params, changes));
  }
}
