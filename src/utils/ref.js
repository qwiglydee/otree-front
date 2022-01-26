/** 
 * Utils to handle references to game state vars and manage their updates.
 * 
 * The references are just strings in form `obj.field.subfield`
 * 
 * @module utils/changes/Ref 
 */

/**
 * Checks if references overlap 
 * 
 * Example: `Ref.includes("foo.bar", "foo.bar.baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
export function includes(parentref, nestedref) {
  return parentref == nestedref || nestedref.startsWith(parentref + ".");
}

/**
 * Strips common part of nested ref, making it local to parent
 *
 * Example: `Ref.strip("foo.bar", "foo.bar.baz") == "baz"`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
export function strip(parentref, nestedref) {
  if (parentref == nestedref) {
    return "";
  } else if (nestedref.startsWith(parentref + ".")) {
    return nestedref.slice(parentref.length + 1);
  } else {
    throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
  }
}

/**
 * Extract a value from object by a ref
 * 
 * Example: `Ref.extract({ foo: { bar: "Bar" } }, "foo.bar") == "Bar"`
 * 
 * @param {object} data 
 * @param {string} ref 
 * @returns {boolean}
 */
export function extract(data, ref) {
  return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
}

/**
 * Sets a value in object by ref.
 * The original object is modified in place
 * 
 * Example: `Ref.update({foo: {bar: "Bar0" } }, "foo.bar", "Bar1") → {foo: {bar: "Bar1" } }`
 * 
 * @param {object} data 
 * @param {ref} ref 
 * @param {*} value 
 */
export function update(data, ref, value) {
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
}
