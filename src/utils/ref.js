/** 
 * Utils to handle references to game state vars and manage their updates.
 * 
 * The references are just strings in form `obj.field.subfield`
 */

const jspath_re = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);

export function validate(ref) {
  if (!ref || !jspath_re.exec(ref)) throw new Error(`Invalid ref: ${ref}`);
}

export function includes(parentref, nestedref) {
  return parentref == nestedref || nestedref.startsWith(parentref + ".");
}

export function strip(parentref, nestedref) {
  if (parentref == nestedref) {
    return "";
  } else if (nestedref.startsWith(parentref + ".")) {
    return nestedref.slice(parentref.length + 1);
  } else {
    throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
  }
}

export function extract(data, ref) {
  return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
}

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
