import { Ref } from "../utils/changes";
import { toggleDisplay } from "../utils/dom";

export function otWhen(page) {
  page.body.querySelectorAll("[data-ot-when]").forEach((elem) => {
    const params = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem });
    page.on("otree.update", handle_update, { elem, ...params });
  });
}

function parse_params(elem) {
  const match = elem.dataset.otWhen.match(/^([\w.]+)(==(.+))?$/);
  if (!match) throw new Error(`Invalid expression for when: ${elem.dataset.otWhen}`);
  let ref = match[1];
  Ref.validate(ref);
  let cond = match[3];
  if (cond === "true") cond = true;
  if (cond === "false") cond = false;
  return { ref, cond };
}

function eval_display(params, changes) {
  let value = changes.pick(params.ref);

  if (params.cond === undefined) {
    // when="fld"
    // anything true-like
    return !!value;
  } else {
    // when="fld==val"
    // non-strict eq so that numbers work
    return value == params.cond;
  }
}

function handle_reset(page, conf, event) {
  toggleDisplay(conf.elem, false);
}

function handle_update(page, conf, event) {
  const { elem, ref } = conf;
  const changes = event.detail;
  if (changes.affects(ref)) {
    toggleDisplay(elem, eval_display(conf, changes));
  }
}
