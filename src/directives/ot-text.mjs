import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setText } from "../utils/dom";

export function otText(page) {
  page.body.querySelectorAll("[data-ot-text]").forEach((elem) => {
    const params = parse_params(elem);
    onPage(page, elem, params, 'otree.reset', handle_reset);
    onPage(page, elem, params, 'otree.update', handle_update);
  });
}

function parse_params(elem) {
  let ref = elem.dataset.otText;
  Ref.validate(ref);
  return { ref };
}

function eval_text(params, changes) {
  return changes.pick(params.ref);
}

function handle_reset(page, target, params, event) {
  setText(target, null);
}

function handle_update(page, target, params, event) {
  const changes = event.detail;
  if (changes.affects(params.ref)) {
    setText(target, eval_text(params, changes));
  }
}
