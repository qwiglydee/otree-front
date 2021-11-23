import { Ref } from "../utils/changes";
import { setClasses } from "../utils/dom";

export function otClass(page) {
  page.body.querySelectorAll("[data-ot-class]").forEach((elem) => {
    const params = parse_params(elem);
    page.on("otree.reset", handle_reset, { elem, ...params });
    page.on("otree.update", handle_update, { elem, ...params });
  });
}

function parse_params(elem) {
  let ref = elem.dataset.otClass;
  Ref.validate(ref);
  return {
    ref,
    defaults: Array.from(elem.classList),
  };
}

function eval_classes(params, changes) {
  let classes = params.defaults.slice();
  let val = changes.pick(params.ref);
  if (!!val) {
    classes.push(val);
  }
  return classes;
}

function handle_reset(page, conf, event) {
  setClasses(conf.elem, conf.defaults);
}

function handle_update(page, conf, event) {
  const changes = event.detail;
  if (changes.affects(conf.ref)) {
    setClasses(conf.elem, eval_classes(conf, changes));
  }
}
