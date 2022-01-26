const VAREXPR = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);
const CONDEXPR = new RegExp(/^([\w.]+)( ([!=]=) (.+))?$/);

export function parseVar(expr) {
  let match = VAREXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid expression for var: "${ref}"`);
  }

  return match[0];
}

export function parseCond(expr) {
  let match = CONDEXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid expression for ot-if: "${expr}"`);
  }

  let varmatch = VAREXPR.exec(match[1]);
  if (!varmatch) {
    throw new Error(`Invalid expression for ot-if var: "${ref}"`);
  }

  let [_0, ref, _2, eq, val] = match;

  if (val) {
    try {
      val = JSON.parse(val.replaceAll("'", '"'));
    } catch {
      throw new Error(`Invalid expression for ot-if value: ${val}`);
    }
  } else {
    val = undefined;
  }

  return [ref, eq, val];
}

export function evalCond(refval, eq, matchval) {
  if (eq === undefined) return !!refval ;  
  if (eq == "==") return refval === matchval;
  if (eq == "1=") return refval !== matchval;
}
