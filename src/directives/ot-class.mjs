import { Ref } from "../utils/changes";
import { setClasses } from "../utils/dom";

export function install_otClass(root) {
  root.querySelectorAll("[data-ot-class]").forEach((elem) => {
    const params = parse_params(elem);
    root.addEventListener("ot.reset", (event) => handle_reset(event, elem, params));
    root.addEventListener("ot.update", (event) => handle_update(event, elem, params));
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

function handle_reset(event, elem, params) {
  setClasses(elem, params.defaults);
}

function handle_update(event, elem, params) {
  const { changes } = event.detail;
  if (changes.affects(params.ref)) {
    setClasses(elem, eval_classes(params, changes));
  }
}
