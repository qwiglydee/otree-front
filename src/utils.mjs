
const jspath_re = new RegExp(/^\w+(\.\w+)*$/);

export function jspath_parse(jspath) {
    if (!jspath.match(jspath_re)) throw new SyntaxError(`Syntax error in var path: ${jspath}`);
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

export function toggle_disabled(elem, disabled) {
    elem.disabled = disabled;
}
