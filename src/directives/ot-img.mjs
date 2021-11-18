import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setChild } from "../utils/dom";

export function otImg(page) {
  page.body.querySelectorAll("[data-ot-img]").forEach((elem) => {
    const params = parse_params(elem);
    onPage(page, elem, params, 'otree.reset', handle_reset);
    onPage(page, elem, params, 'otree.update', handle_update);
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

function handle_reset(page, target, params, event) {
  setChild(target, null);
}

function handle_update(page, target, params, event) {
  const changes = event.detail;
  if (changes.affects(params.ref)) {
    setChild(target, eval_img(params, changes));
  }
}
