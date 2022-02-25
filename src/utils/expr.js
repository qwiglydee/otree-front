import { overlapsRef, extractByRef } from "./ref";

const EXPR_RE = new RegExp(/^(?<ref>[a-zA-Z]\w+(\.\w+)*)( (?<op>=|==|!=) (?<arg>.+))?$/);

export function parseExpr(expr) {
  let match = expr.match(EXPR_RE);
  if (!match) {
    throw new Error(`invalid expression: "${expr}"`);
  }

  let { ref, op, arg } = match.groups;

  if (op === undefined) {
    return new VarExpr(ref);
  } else {
    try {
      arg = JSON.parse(match.groups.arg.replaceAll("'", '"'));
    } catch {
      throw new Error(`invalid expression for value: "${expr}"`);
    }
    if (op == "=") return new InpExpr(ref, arg);
    if (op == "==" || op == "!=") return new CmpExpr(ref, op, arg);
    throw new Error(`unsupported expression: ${expr}`);
  }
}

function affects(event, ref) {
  switch (event.type) {
    case "ot.reset":
      return event.detail == null || event.detail.some((v) => overlapsRef(v, ref));
    case "ot.update":
      return event.detail.affects(ref);
    case "ot.input":
      return overlapsRef(event.detail.name, ref);
    default:
      throw new Error("irrelevant event");
  }
}

export class VarExpr {
  constructor(ref) {
    this.ref = ref;
  }

  affected(event) {
    return affects(event, this.ref);
  }

  eval(event) {
    switch (event.type) {
      case "ot.reset":
        return undefined;
      case "ot.update":
        return event.detail.pick(this.ref);
      case "ot.input":
        if (event.detail.name == this.ref) return event.detail.value;
        if (overlapsRef(event.detail.name, this.ref))
          return extractByRef(this.ref, { [event.detail.name]: event.detail.value });
    }
  }
}

export class CmpExpr {
  constructor(ref, op, arg) {
    this.ref = ref;
    this.op = op;
    this.arg = arg;
  }

  affected(event) {
    return affects(event, this.ref);
  }

  eval(event) {
    let val;
    switch (event.type) {
      case "ot.reset":
        return false;
      case "ot.update":
        val = event.detail.pick(this.ref);
        break;
      case "ot.input":
        val = event.detail.value;
        break;
    }

    if (this.op == "==") return val === this.arg;
    if (this.op == "!=") return val !== this.arg;
    throw new Error(`Unsuppoted comparision operator: ${this.op}`);
  }
}

export class InpExpr {
  constructor(ref, val) {
    this.ref = ref;
    this.val = val;
  }

  affected(event) {
    return affects(event, this.ref);
  }
}
