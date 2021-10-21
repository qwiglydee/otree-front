import { jspath_extract, jspath_parse, toggle_display } from "./utils";


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
    let params = {};
    for (let item in elem.dataset) {
        if (item.startsWith('otAttr')) {
            params[item.slice(6).toLocaleLowerCase()] = jspath_parse(elem.dataset[item]);
        }
    }
    return params;
}

function eval_attrs(params, state) {
    let values = {};
    for (const [k, path] of Object.entries(params)) {
        values[k] = jspath_extract(path, state);
    }
    return values;
}

function set_attrs(elem, attrs) {
    for (const [k, val] of Object.entries(attrs)) {
        if (val === undefined || val === null) {
            elem.removeAttribute(k);
        } else {
            elem.setAttribute(k, val);
        }
    }
}

function handle_reset(event, elem, params) {
    const { page } = event.detail;
    set_attrs(elem, eval_attrs(params, page.state));
}

function handle_update(event, elem, params) {
    const { page, changes } = event.detail;
    // TODO: check if attrs in update
    set_attrs(elem, eval_attrs(params, page.state));
}