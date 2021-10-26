
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

export function loadImage(url) {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

export function random_choice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}
