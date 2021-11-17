import { Ref } from "../utils/changes";
import { setText } from "../utils/dom";

export function install_otText(root) {
  root.querySelectorAll("[data-ot-text]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
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

function handle_reset(event, elem, params) {
  setText(elem, null);
}

function handle_update(event, elem, params) {
  const { changes } = event.detail;
  if (changes.affects(params.ref)) {
    setText(elem, eval_text(params, changes));
  }
}
