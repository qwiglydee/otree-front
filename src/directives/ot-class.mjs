import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setClasses } from "../utils/dom";

export function otClass(page) {
  page.body.querySelectorAll("[data-ot-class]").forEach((target) => {
    const params = parse_params(target);
    onPage({ page, target, ...params }, "otree.reset", handle_reset);
    onPage({ page, target, ...params }, "otree.update", handle_update);
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

function handle_reset(conf, event) {
  setClasses(conf.target, conf.defaults);
}

function handle_update(conf, event) {
  const changes = event.detail;
  if (changes.affects(conf.ref)) {
    setClasses(conf.target, eval_classes(conf, changes));
  }
}
