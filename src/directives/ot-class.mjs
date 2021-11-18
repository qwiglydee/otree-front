import { Ref } from "../utils/changes";
import { onPage } from "../utils/events";
import { setClasses } from "../utils/dom";

export function otClass(page) {
  page.body.querySelectorAll("[data-ot-class]").forEach((elem) => {
    const params = parse_params(elem);
    onPage(page, elem, params, 'otree.reset', handle_reset);
    onPage(page, elem, params, 'otree.update', handle_update);
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

function handle_reset(page, target, params, event) {
  setClasses(target, params.defaults);
}

function handle_update(page, target, params, event) {
  const changes = event.detail;
  if (changes.affects(params.ref)) {
    setClasses(target, eval_classes(params, changes));
  }
}
