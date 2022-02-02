const VAREXPR = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);

export function parseVar(expr) {
  let match = VAREXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid expression for var: "${expr}"`);
  }

  let ref = match[0];
  return { ref };
}

export function evalVar(parsed, changes) {
  const { ref } = parsed;

  return changes.pick(ref);
}


const CONDEXPR = new RegExp(/^([\w.]+)( ([!=]=) (.+))?$/);

export function parseCond(expr) {
  let match = CONDEXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid condition expression: "${expr}"`);
  }

  let varmatch = VAREXPR.exec(match[1]);
  if (!varmatch) {
    throw new Error(`Invalid variable in condition expression: "${expr}"`);
  }

  let [_0, ref, _2, eq, val] = match;

  if (val) {
    try {
      val = JSON.parse(val.replaceAll("'", '"'));
    } catch {
      throw new Error(`Invalid value in condition expression: ${expr}`);
    }
  } else {
    val = undefined;
  }

  return { ref, eq, val };
}

export function evalCond(parsed, changes) {
  const { ref, eq, val } = parsed;

  let value = changes.pick(ref);

  if (eq === undefined) return !!value;
  if (eq == "==") return value === val;
  if (eq == "!=") return value !== val;
}

const ASSIGNEXPR = new RegExp(/^([\w.]+) = (.+)?$/);

export function parseAssign(expr) {
  let match = ASSIGNEXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid input expression: "${expr}"`);
  }

  let varmatch = VAREXPR.exec(match[1]);
  if (!varmatch) {
    throw new Error(`Invalid variable in input expression: "${expr}"`);
  }

  let [_0, ref, val] = match;

  try {
    val = JSON.parse(match[2].replaceAll("'", '"'));
  } catch {
    throw new Error(`Invalid value in assignment expression: ${expr}`);
  }

  return { ref, val };
}

export function evalAssign(parsed) {
  return { [parsed.ref]: parsed.val };
}

/**
 * Checks if an event affects an expression
 *
 * @param {Event} event
 * @param {object} expr parsed expression containing ref to a var
 */
export function affecting(parsed, event) {
  switch (event.type) {
    case "ot.reset":
      let vars = event.detail;
      return vars == undefined || vars.includes(parsed.ref);
    case "ot.update":
      let changes = event.detail;
      return changes.affects(parsed.ref);
    default:
      return false;
  }
}
