const _slot_re = new RegExp(/\$\{(\w+(\.\w+)*)\}/, 'g');


export function tmpl_slots(tmpl) {
    return new Set(Array.from(tmpl.matchAll(_slot_re)).map(m => m[1]));
}

export function tmpl_deps(tmpl) {
    return new Set(Array.from(tmpl_slots(tmpl)).map(slot => slot.split('.')[0]));
}

export function tmpl_path_extract(path, data) {
    return path.split('.').reduce((o, k) => {
        if (o === undefined || !(k in o)) return undefined;
        return o[k];
    }, data);
}

export function tmpl_interpolate(tmpl, context) {
    function extract(p) {
        let val = tmpl_path_extract(p, context);
        if (val === undefined) throw new Error(`missing data path ${p}`);
        return val;
    }
    return tmpl.replaceAll(_slot_re, (m0, m1) => extract(m1, context));
}