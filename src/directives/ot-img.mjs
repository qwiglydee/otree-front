import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setChild } from "../utils/dom";

export function otImg(page) {
  page.body.querySelectorAll("[data-ot-img]").forEach((target) => {
    const ref = parse_params(target);
    onPage({ page, target }, "otree.reset", handle_reset);
    onPage({ page, target, ref }, "otree.update", handle_update);
  });
}

function parse_params(elem) {
  let ref = elem.dataset.otImg;
  Ref.validate(ref);
  return ref;
}

function eval_img(ref, changes) {
  let img = changes.pick(ref);
  if (!!img && !(img instanceof Image)) {
    throw new Error(`Invalid value for image: ${img}`);
  }
  return img;
}

function handle_reset(conf, event) {
  setChild(conf.target, null);
}

function handle_update(conf, event) {
  const { target } = conf;
  const changes = event.detail;
  if (changes.affects(conf.ref)) {
    setChild(target, eval_img(conf.ref, changes));
  }
}
