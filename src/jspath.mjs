export function jspath(path, obj) {
    return path.split('.').reduce((o, k) => o[k], obj);
}