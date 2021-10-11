const _slot_re = new RegExp(/\$\{(\w+(\.\w+)*)\}/, 'g');

export function tmpl_slots(tmpl) {
    return Array.from(tmpl.matchAll(_slot_re)).map(m => m[1]);
}

export function tmpl_paths(tmpl) {
    return tmpl_slots(tmpl).map(slot => slot.split('.'));
}

export function tmpl_deps(tmpl) {
    return new Set(tmpl_paths(tmpl).map(path => path[0]));
}

export function tmpl_interpolate(tmpl, context) {
    function extract(path) {
        return path.reduce((o, k) => {
            if (!(k in o)) { throw new Error(`missing data '${k}' in '${path}'`)}
            return o[k];
        }, context);
    }

    return tmpl.replaceAll(_slot_re, (m0, m1) => extract(m1.split('.')));
}