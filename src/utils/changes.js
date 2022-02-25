/**
 * Utils to handle changes of game state data
 *
 * @module utils/changes
 */

import * as ref from "./ref";

const VAR_RE = new RegExp(/^(?<ref>[a-zA-Z]\w+(\.\w+)*)$/);

/**
 * A set of references to vars and their new values.
 *
 * The references are in form `obj.field.subfield` and correspond to a game state.
 */
export class Changes extends Map {
  /**
   * @param {object} obj plain object describing changes
   */

  constructor(obj) {
    if (obj) {
      super(Array.from(Object.entries(obj)));
    } else {
      super();
    }
    // validate keys
    if( ! Array.from(this.keys()).every(k => k.match(VAR_RE))) {
      throw new Error("Some changes keys are invalid");
    }
  }

  prefix(pref) {
    let prefixed = new Changes();
    for(let [k, v] of this.entries()) {
      prefixed.set(`${pref}.${k}`, v);
    }
    return prefixed;
  }

  /**
   * Checks if the changeset affects a var or a subvar
   *
   * ```
   * let changes = new Changes({ 'foo.bar': something });
   * expect(changes.affect("foo.bar")).to.be.true;
   * expect(changes.affect("foo.bar.anything")).to.be.true;
   * expect(changes.affect("foo.*")).to.be.true;
   *
   * @param {*} fld
   */
  affects(fld) {
    if (fld.endsWith(".*")) {
      let top = fld.slice(0, -2);
      return this.has(top) || Array.from(this.keys()).some((key) => ref.isparentRef(top, key));
    } else {
      return this.has(fld) || Array.from(this.keys()).some((key) => ref.isparentRef(key, fld));
    }
  }

  /**
   * Picks single value from changeset, tracking reference across keys or nested objects.
   *
   * ```
   * let change = new Changes({ 'foo.bar': { baz: "Baz"} })
   * expect(change.pick('foo')).to.be.eq({ 'bar': { 'baz': "Baz" }})
   * expect(change.pick('foo.bar')).to.be.eq({ 'baz': "Baz" })
   * ```
   *
   */
  pick(fld) {
    if (this.has(fld)) {
      return this.get(fld);
    }
    // console.debug("picking", fld, "from", Array.from(this.keys()));

    // fld.subfld: something
    let nesting = Array.from(this.keys()).filter((k) => ref.isparentRef(fld, k));
    // console.debug("nesting", nesting);
    if (nesting.length) {
      let result = {};
      for (let k of nesting) {
        let subfld = ref.getsubRef(fld, k);
        result[subfld] = this.get(k);
      }
      return result;
    }

    // fld[top]: { fld[sub]: something }
    let splitting = Array.from(this.keys()).filter((k) => ref.isparentRef(k, fld) && this.get(k) !== undefined);
    // console.debug("splitting", splitting);
    if (splitting.length) {
      for (let k of splitting) {
        let fldsub = ref.getsubRef(k, fld);
        return ref.extractByRef(fldsub, this.get(k))
      }
    }
  }

  /**
   * Apply changes
   *
   * Modify an obj by all the changes.
   *
   * Example:
   *    ```
   *    obj = { obj: { foo: { bar: "xxx" } } }
   *    changes = new Changes({ 'obj.foo': { bar: "Bar" } })
   *    changes.patch(obj)
   *
   *    obj == { obj: { foo: { bar: "Bar" } } }
   *    ```
   *
   * It works with arrays as well, when using indexes as subfields.
   *
   */
  patch(obj) {
    this.forEach((v, k) => {
      ref.updateByRef(k, obj, v);
    });
  }
}
