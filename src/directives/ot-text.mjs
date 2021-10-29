import { setText } from "../utils";

import { JSPath } from "../jspath";

export function install_otText(root) {
  root.querySelectorAll("[data-ot-text]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
  });
}

function parse_params(elem) {
  return { ref: new JSPath(elem.dataset.otText) };
}

function eval_text(params, changes) {
  return params.ref.extract(changes);
}

function handle_reset(event, elem, params) {
  setText(elem, null);
}

function handle_update(event, elem, params) {
  const { changes } = event.detail;
  setText(elem, eval_text(params, changes));
}
