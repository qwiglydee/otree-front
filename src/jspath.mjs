const RE = new RegExp(/^\w+(\.\w+)*$/);



/** JSPath
 * Handles data references like "parentobj.obj.fld"
 */
export class JSPath {
  constructor(path) {
    if (!path || !RE.exec(path)) throw new Error(`Syntax error in var path: ${path}`);
    let elems = path.split(".");
    this.length = elems.length;
    this.objpath = elems.slice(0, -1);
    this.fld = elems.slice(-1)[0];
  }

  /** Extract value from data
   * @returns value of the field
   */
  extract(data) {
    let obj = this.objpath.reduce((o, k) => (o && k in o ? o[k] : undefined), data);
    if (obj === undefined) return undefined;
    return obj[this.fld];
  }

  /** Expands path into object
   * @returns new object with all the keys from path created
   */
  expand(value) {
    const data = {};
    let obj = this.objpath.reduce((o, k) => _ins(o, k), data);
    obj[this.fld] = value;
    return data;
  }

  /** Update data under the path
   * create subobj if needed
   */
  update(data, value) {
    let obj = this.objpath.reduce((o, k) => (k in o ? o[k] : _ins(o, k)), data);
    if (obj === undefined) throw new Error("Path not found");
    obj[this.fld] = value;
    return data;
  }
}

function _ins(obj, key) {
  return (obj[key] = {});
}
