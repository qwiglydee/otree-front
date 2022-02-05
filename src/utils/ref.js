/** 
 * Utils to handle references to game state vars and manage their updates.
 * 
 * The references are just strings in form `obj.field.subfield`
 * 
 * @module utils/ref 
 */

/**
 * Checks if one ref is parent of other
 * 
 * `expect(isparentRef("foo.bar", "foo.bar.baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
export function isparentRef(parentref, nestedref) {
  return nestedref.startsWith(parentref + ".");
}

/**
 * Strips common part of nested ref, making it local to parent
 *
 * `expect(getsubRef("foo.bar", "foo.bar.baz").to.be.eq("baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
export function getsubRef(parentref, nestedref) {
  if (parentref == nestedref) {
    return "";
  } else if (nestedref.startsWith(parentref + ".")) {
    return nestedref.slice(parentref.length + 1);
  } else {
    throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
  }
}

/**
 * Extracts common top path
 *
 * `expect(gettopRef("foo.bar.baz", "foo.bar.qux").to.be.eq("foo.bar")`
 * 
 * @param {string} fld1
 * @param {string} fld2
 * @returns {boolean}
 */
 export function gettopRef(fld1, fld2) {
  if (fld1 == fld2) {
    return fld1;
  }

  let path1 = fld1.split('.'), path2 = fld2.split('.');
  let maxi = Math.min(path1.length, path2.length);
  let path = [] ;
  for(let i=0; i<maxi; i++) {
    if( path1[i] == path2[i] ) {
      path.push(path1[i]);
    } else {
      break;
    }
  }
  if (path.length == 0) return undefined;
  return ".".join(path);
  
}

/**
 * Extract a value from object by a ref
 * 
 * ```
 * let obj = {foo:{bar:"Bar"}};
 * expect(extractByRef("foo.bar", obj).to.be.eq("Bar")`
 * ```
 * 
 * @param {object} data 
 * @param {string} ref 
 * @returns {boolean}
 */
export function extractByRef(ref, data) {
  return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
}

/**
 * Sets a value in object by ref.
 * The original object is modified in place
 * 
 * ```
 * let obj = {foo:{bar:"Bar"}};
 * updateByRef("foo.bar", obj, "newval");
 * expect(obj.foo.bar).to.be.eq("newval");
 * ```
 * @param {object} data 
 * @param {ref} ref 
 * @param {*} value 
 */
export function updateByRef(ref, data, value) {
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

  return data; 
}
