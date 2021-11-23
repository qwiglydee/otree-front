import { Ref } from "../utils/changes";
import { setChild } from "../utils/dom";

export function otImg(page) {
  page.body.querySelectorAll("[data-ot-img]").forEach((elem) => {
    const ref = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem });
    page.on("otree.update", handle_update, { elem, ref });
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

function handle_reset(page, conf, event) {
  setChild(conf.elem, null);
}

function handle_update(page, conf, event) {
  const { elem, ref } = conf;
  const changes = event.detail;
  if (changes.affects(ref)) {
    setChild(elem, eval_img(ref, changes));
  }
}
