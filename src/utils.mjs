export function jspath_parse(jspath) {
    return jspath.split('.');
}

export function jspath_extract(path, obj) {
    return path.reduce((o, k) => {
        if (o === undefined || !(k in o)) return undefined;
        return o[k];
    }, obj);
}

export function toggle_display(elem, display) {
    elem.style.display = display ? null : "none";
}
