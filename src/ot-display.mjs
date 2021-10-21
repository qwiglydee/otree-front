import {jspath_extract, jspath_parse, toggle_display} from "./utils";


export function install_otDisplay(root) {
    root.querySelectorAll("[data-ot-display-delay], [data-ot-display-exposure]").forEach(elem => {
        root.addEventListener('ot.reset', handler_reset(elem));
        root.addEventListener('ot.display', handler_display(elem));
    });
}


function parse_params(elem) {
    return {
        delay: 'otDisplayDelay' in elem.dataset ? Number(elem.dataset.otDisplayDelay) : undefined,
        exposure: 'otDisplayExposure' in elem.dataset ? Number(elem.dataset.otDisplayExposure) : undefined,
    };
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

function handler_reset(elem) {
    const params = parse_params(elem);
    return function(event) {
        // FIXME: cancel any pending timers
        toggle_display(elem, false);
    }
}

function handler_display(elem) {
    const params = parse_params(elem);
    return function(event) {
        display(elem, params);
    }
}