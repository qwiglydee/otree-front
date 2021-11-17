/** Reference/Change utils
 * Utils to handle references to game state vars and manage their updates
 */

export const Ref = {
  jspath_re: new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/),

  validate(ref) {
    if (!ref || !Ref.jspath_re.exec(ref)) throw new Error(`Invalid ref: ${ref}`);
  },

  includes(parentref, nestedref) {
    return parentref == nestedref || nestedref.startsWith(parentref + ".");
  },

  strip(parentref, nestedref) {
    if (parentref == nestedref) {
      return "";
    } else if (nestedref.startsWith(parentref + ".")) {
      return nestedref.slice(parentref.length + 1);
    } else {
      throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
    }
  },

  extract(data, ref) {
    return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
  },

  update(data, ref, value) {
    function ins(obj, key) {
      return (obj[key] = {});
    }

    const path = ref.split("."),
      objpath = path.slice(0, -1),
      fld = path[path.length - 1];

    let obj = objpath.reduce((o, k) => (k in o ? o[k] : ins(o, k)), data);
    if (obj === undefined) throw new Error(`Incompatible ref ${ref}`);
    if (value === undefined) {
      delete obj[fld];
    } else {
      obj[fld] = value;
    }
  },
};

export class Changes extends Map {
  constructor(obj) {
    super([...Object.entries(obj)]);
    this.forEach((v, k) => Ref.validate(k));
  }

  /** Checks if the changeset affects referenced var */
  affects(ref) {
    return [...this.keys()].some((key) => Ref.includes(key, ref));
  }

  /** Picks single value from changeset */
  pick(ref) {
    let affecting = [...this.keys()].filter((key) => Ref.includes(key, ref));
    if (affecting.length == 0) return undefined;
    if (affecting.length != 1) throw new Error(`Incompatible changeset for ${ref}`);
    affecting = affecting[0];

    let value = this.get(affecting);

    if (affecting == ref) {
      return value;
    } else {
      return Ref.extract(value, Ref.strip(affecting, ref));
    }
  }

  /** Apply changes
   * Modify an obj by changes
   */
  patch(obj) {
    this.forEach((v, k) => {
      Ref.update(obj, k, v);
    });
  }
}
