import { Ref } from "../utils/changes";
import { setText } from "../utils/dom";

export function otText(page) {
  page.body.querySelectorAll("[data-ot-text]").forEach((elem) => {
    const ref = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem });
    page.on("otree.update", handle_update, { elem, ref });
  });
}

function parse_params(elem) {
  let ref = elem.dataset.otText;
  Ref.validate(ref);
  return ref;
}

function eval_text(ref, changes) {
  return changes.pick(ref);
}

function handle_reset(page, conf, event) {
  setText(conf.elem, null);
}

function handle_update(page, conf, event) {
  const { elem, ref } = conf;
  const changes = event.detail;
  if (changes.affects(ref)) {
    setText(elem, eval_text(ref, changes));
  }
}
