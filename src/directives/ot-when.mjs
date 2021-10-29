import { toggleDisplay } from "../utils";

import { JSPath } from "../jspath";

export function install_otWhen(root) {
  root.querySelectorAll("[data-ot-when]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
  });
}

function parse_params(elem) {
  const match = elem.dataset.otWhen.match(/^([\w.]+)(==(.+))?$/);
  if (!match) throw new Error(`Invalid expression for when: ${elem.dataset.otWhen}`);
  let ref = new JSPath(match[1]);
  let cond = match[3];
  if (cond === "true") cond = true;
  if (cond === "false") cond = false;
  return { ref, cond };
}

function eval_display(params, changes) {
    let value = params.ref.extract(changes);

    if (value === undefined) { // skip changing
        return undefined;
    }
    if (params.cond === undefined) { // when="fld"
        // anything true-like
        return !!value;
    } else { // when="fld==val"
         // non-strict eq so that numbers work
        return value == params.cond;
    }
}

function handle_reset(event, elem, params) {
  toggleDisplay(elem, false);
}

function handle_update(event, elem, params) {
  const { changes } = event.detail;
  toggleDisplay(elem, eval_display(params, changes));
}
