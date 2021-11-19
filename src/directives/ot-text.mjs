import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setText } from "../utils/dom";

export function otText(page) {
  page.body.querySelectorAll("[data-ot-text]").forEach((target) => {
    const ref = parse_params(target);
    onPage({ page, target }, "otree.reset", handle_reset);
    onPage({ page, target, ref }, "otree.update", handle_update);
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

function handle_reset(conf, event) {
  setText(conf.target, null);
}

function handle_update(conf, event) {
  const { target, ref } = conf;
  const changes = event.detail;
  if (changes.affects(ref)) {
    setText(target, eval_text(ref, changes));
  }
}
