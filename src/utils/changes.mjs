/** Reference/Change utils
 * Utils to handle references to game state vars and manage their updates
 */

const RE = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);

/** Ref
 * Reference to a page variable (game state) in form of "obj.subobj.field"
 */
export class Ref {
  constructor(path) {
    if (path instanceof Ref) {
      this.strpath = path.strpath;
      this.objpath = path.objpath.slice();
      this.length = path.length;
      return;
    }

    if (!path || !RE.exec(path)) throw new Error(`Syntax error in ref: ${path}`);
    this.strpath = path;
    this.objpath = path.split(".");
    this.length = this.objpath.length;
  }

  /** Check if the ref affects another
   * Check if var by this ref would override var by another ref
   * @returns (bool)
   */
  includes(other) {
    if (this.length > other.length) return false;
    return !this.objpath.some((e, i) => e !== other.objpath[i]);
  }

  /** Strip ref prefix
   * Strips this ref from beginning of other ref
   *
   * @param other {Ref} a path to a field
   * @returns {Ref} stripped path
   */
  strip(other) {
    if (!other.strpath.startsWith(this.strpath))
      throw new Error(`incompatible paths: ${other.strpath} / ${this.strpath}`);
    if (other.strpath == this.strpath) return null;
    return new Ref(other.strpath.slice(this.strpath.length + 1));
  }

  /** Extract value from data
   * @returns value of the field
   */
  extract(data) {
    let parent = this.objpath.slice(0, -1);
    let fld = this.objpath[this.objpath.length - 1];

    let obj = parent.reduce((o, k) => (o && k in o ? o[k] : undefined), data);
    if (obj === undefined) return undefined;
    return obj[fld];
  }

  /** Update data under the ref
   * create subobj if needed
   */
  update(data, value) {
    let parent = this.objpath.slice(0, -1);
    let fld = this.objpath[this.objpath.length - 1];

    function _ins(obj, key) {
      return (obj[key] = {});
    }

    let obj = parent.reduce((o, k) => (k in o ? o[k] : _ins(o, k)), data);
    if (obj === undefined) throw new Error("Invalid path");
    if (value === undefined) {
      delete obj[fld];
    } else {
      obj[fld] = value;
    }
  }

  toString() {
    return this.strpath;
  }
}

/** Set of changes
 * Holds a map of refs to values.
 */
export class Changes extends Map {
  /** Initialize
   * @param items object with ref/values or array of entries
   */
  constructor(items) {
    let entries = items instanceof Array ? items : Object.entries(items);
    super(entries.map(([k, v]) => [new Ref(k), v]));
  }

  /** Check if a ref is affected
   * @param ref {Ref} reference to a var from a directive
   * @returns if the changeset affects the var
   */
  affect(ref) {
    return [...this.keys()].some((k) => k.includes(ref));
  }

  /** picks single value from changeset
   * @param ref {Ref} reference to a var from a directive
   * @returns corresponding value from the changeset
   */
  pick(ref) {
    let affecting = [...this.keys()].filter((k) => k.includes(ref));
    if (affecting.length != 1) throw new Error("Incompatible changeset");
    affecting = affecting[0];

    let change = this.get(affecting);
    let stripped = affecting.strip(ref);
    return stripped ? stripped.extract(change) : change;
  }

  /** Apply changes
   * Modify an obj by changes
   */
  patch(obj) {
    this.forEach((v, k) => {
      k.update(obj, v);
    });
  }
}
