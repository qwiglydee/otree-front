import { jspath_extract, jspath_parse, toggle_display } from "../utils";


export function install_otDisplay(root) {
    root.querySelectorAll("[data-ot-display-delay], [data-ot-display-exposure]").forEach(elem => {
        const params = parse_params(elem);
        root.addEventListener('ot.reset', (event) => handle_reset(event, elem, params));
        root.addEventListener('ot.display', (event) => handle_display(event, elem, params));
    });
}


function parse_params(elem) {
    const params = {};
    function parse_param(p, a) {
        if (!(a in elem.dataset)) return;
        let value = Number(elem.dataset[a]);
        if (isNaN(value)) throw Error(`Invalid numeric value: ${elem.dataset[a]}`);
        params[p] = value;
    }

    parse_param('delay', 'otDisplayDelay');
    parse_param('exposure', 'otDisplayExposure');
    return params;
}

function display(elem, params) {
    if (params.delay !== undefined) {
        toggle_display(elem, false);
        setTimeout(() => toggle_display(elem, true), params.delay);
    } else {
        toggle_display(elem, true);
    }

    if (params.exposure !== undefined) {
        setTimeout(() => toggle_display(elem, false), (params.delay || 0) + params.exposure);
    }
}

function handle_reset(event, elem, params) {
    // FIXME: cancel any pending timers
    toggle_display(elem, false);
}

function handle_display(event, elem, params) {
    display(elem, params);
}