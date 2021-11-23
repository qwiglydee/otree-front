import { Ref } from "../utils/changes";
import { setAttr } from "../utils/dom";

const ALLOWED_ATTRIBS = ["disabled", "hidden", "height", "width", "min", "max", "low", "high", "optimum", "value"];

export function otAttr(page) {
  const selector = ALLOWED_ATTRIBS.map((a) => `[data-ot-attr-${a}]`).join(",");
  page.body.querySelectorAll(selector).forEach((elem) => {
    const attrs = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem, attrs });
    page.on("otree.update", handle_update, { elem, attrs });
  });
}

function parse_params(elem) {
  let entries = Object.entries({ ...elem.dataset })
    .filter(([key, _]) => key.startsWith("otAttr"))
    .map(([key, val]) => [key.slice(6).toLocaleLowerCase(), val]);
  let params = new Map(entries);

  params.forEach((ref) => {
    Ref.validate(ref);
  });
  return params;
}

function reset_attrs(elem, attrs) {
  for (let k in attrs.keys()) {
    elem.removeAttribute(k);
  }
}

function eval_attr(params, key, changes) {
  return changes.pick(params.get(key));
}

function handle_reset(page, conf, event) {
  reset_attrs(conf.elem, conf.attrs);
}

function handle_update(page, conf, event) {
  const { elem, attrs } = conf;
  const changes = event.detail;

  attrs.forEach((ref, attr) => {
    if (changes.affects(ref)) {
      setAttr(elem, attr, changes.pick(ref));
    }
  });
}
