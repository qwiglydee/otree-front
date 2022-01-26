/**
 * Utils to handle changes of game state data
 *
 * @module utils/changes
 */

import { parseVar } from "../utils/expr";
import * as Ref from "./ref";

export { Ref };

/**
 * A set of references to vars and their new values.
 *
 * The references are in form `obj.field.subfield` and correspond to a game state.
 */
export class Changes extends Map {
  /**
   * @param {object} obj plain object describing changes
   * @param {string} [prefix] a prefix to add to all the top-level fields, as if there was an above-top object
   */

  constructor(obj, prefix) {
    let entries = [...Object.entries(obj)];
    if (prefix) {
      entries = entries.map(([k, v]) => [prefix + "." + k, v]);
    }
    super(entries);
    this.forEach((v, k) => parseVar(k));
  }

  /**
   * Checks if the changeset contains referenced var
   *
   * Example:
   *   ```
   *   changes = new Changes({ 'obj.foo': { ... } })
   *   changes.afects("obj.foo.bar") == true // becasue the `bar` is contained in `obj.foo`
   *   ```
   * @param {string} ref
   */
  affects(ref) {
    return [...this.keys()].some((key) => Ref.includes(key, ref));
  }

  /**
   * Picks single value from changeset.
   *
   * Example:
   *   ```
   *   changes = new Changes({ 'obj.foo': { bar: "Bar" } })
   *   changes.pick("obj.foo.bar") == "Bar"
   *   ```
   */
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
      Ref.update(obj, k, v);
    });
  }
}
