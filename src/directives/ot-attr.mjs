import { Ref, Changes } from "../utils/changes";
import { setAttr } from "../utils/dom";

const ALLOWED_ATTRIBS = [
    'disabled', 'hidden',
    'height', 'width',
    'min', 'max', 'low', 'high', 'optimum', 'value'
]

export function install_otAttr(root) {
    const selector = ALLOWED_ATTRIBS.map(a => `[data-ot-attr-${a}]`).join(",");
    root.querySelectorAll(selector).forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.update', (event) => handle_update(event, elem, params));
    });
}


function parse_params(elem) {
    let params = new Map();
    for (let key in elem.dataset) {
        if (key.startsWith('otAttr')) {
            params.set(key.slice(6).toLocaleLowerCase(), new Ref(elem.dataset[key]));
        }
    }
    return params;
}

function reset_attrs(elem, params) {
    for (let k in params.keys()) {
        elem.removeAttribute(k);
    }
}

function eval_attr(params, key, changes) {
    return changes.pick(params.get(key))
}

function handle_reset(event, elem, params) {
    reset_attrs(elem, params);
}

function handle_update(event, elem, params) {
    const { changes } = event.detail;

    params.forEach((ref, attr) => {
        if (changes.affect(ref)) {
            setAttr(elem, attr, changes.pick(ref));
        }
    });
}