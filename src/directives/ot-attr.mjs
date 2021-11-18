import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setAttr } from "../utils/dom";

const ALLOWED_ATTRIBS = ["disabled", "hidden", "height", "width", "min", "max", "low", "high", "optimum", "value"];

export function otAttr(page) {
  const selector = ALLOWED_ATTRIBS.map((a) => `[data-ot-attr-${a}]`).join(",");
  page.body.querySelectorAll(selector).forEach((elem) => {
    const params = parse_params(elem);
    onPage(page, elem, params, 'otree.reset', handle_reset);
    onPage(page, elem, params, 'otree.update', handle_update);
  });
}

function parse_params(elem) {
  let entries = Object.entries({ ...elem.dataset })
    .filter(([key, _])=> key.startsWith("otAttr"))
    .map(([key, val]) => [key.slice(6).toLocaleLowerCase(), val]);
  let params = new Map(entries);

  params.forEach(ref => { Ref.validate(ref); })
  return params;
}

function reset_attrs(elem, params) {
  for (let k in params.keys()) {
    elem.removeAttribute(k);
  }
}

function eval_attr(params, key, changes) {
  return changes.pick(params.get(key));
}

function handle_reset(page, target, params, event) {
  reset_attrs(target, params);
}

function handle_update(page, target, params, event) {
  const changes = event.detail;

  params.forEach((ref, attr) => {
    if (changes.affects(ref)) {
      setAttr(target, attr, changes.pick(ref));
    }
  });
}
