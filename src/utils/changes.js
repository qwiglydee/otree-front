/** Reference/Change utils
 * Utils to handle references to game state vars and manage their updates
 */

import * as Ref from "./ref";

export { Ref };

export class Changes extends Map {
  constructor(obj, prefix) {
    let entries = [...Object.entries(obj)];
    if (prefix) {
      entries = entries.map(([k, v]) => [prefix + "." + k, v]);
    } 
    super(entries);
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
