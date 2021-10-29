import { JSPath } from "../jspath";

import { setClasses } from "../utils";

export function install_otClass(root) {
  root.querySelectorAll("[data-ot-class]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
  });
}

function parse_params(elem) {
  return {
    ref: new JSPath(elem.dataset.otClass),
    defaults: Array.from(elem.classList),
  };
}

function eval_classes(params, changes) {
  let val = params.ref.extract(changes);
  let classes = params.defaults.slice();
  if (val === undefined) return undefined; // skip changing
  if (!!val) {
    classes.push(val);
  }
  return classes;
}

function handle_reset(event, elem, params) {
  setClasses(elem, params.defaults);
}

function handle_update(event, elem, params) {
  const { changes } = event.detail;
  setClasses(elem, eval_classes(params, changes));
}
