import { expect } from "@open-wc/testing";

import { Changes } from "../../src/utils/changes";
import { parseVar, evalVar, parseCond, evalCond, parseAssign, evalAssign } from "../../src/utils/expr";

describe("expressions", () => {
  describe("variables", () => {
    describe("parsing", () => {
      it("parses `var`", () => {
        let parsing = () => parseVar("var");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var" });
      });

      it("parses `obj.fld`", () => {
        let parsing = () => parseVar("obj.fld");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "obj.fld" });
      });

      it("fails on padding spaces", () => {
        let parsing = () => parseVar(" var ");
        expect(parsing).to.throw();
      });

      it("fails on intra spaces", () => {
        let parsing = () => parseVar("obj . fld");
        expect(parsing).to.throw();
      });

      it("fails on invalid chars", () => {
        let parsing = () => parseVar("obj[fld]");
        expect(parsing).to.throw();
      });

      it("fails on conditionals", () => {
        let parsing = () => parseVar("var == true");
        expect(parsing).to.throw();
      });

      it("fails on assignments", () => {
        let parsing = () => parseVar("var = true");
        expect(parsing).to.throw();
      });
    });

    describe("evaluating", () => {
      it("`var`", () => {
        let parsed = parseVar("var");
        let changes = new Changes({ var: "Val" });
        let result = evalVar(parsed, changes);
        expect(result).to.eq("Val");
      });

      it("`obj.fld`", () => {
        let parsed = parseVar("obj.fld");
        let changes = new Changes({ "obj.fld": "Val" });
        let result = evalVar(parsed, changes);
        expect(result).to.eq("Val");
      });
    });
  });

  describe("conditonals", () => {
    describe("parsing", () => {
      it("parses `var`", () => {
        let parsing = () => parseCond("var");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: undefined, val: undefined });
      });

      it("parses `var == 'str'`", () => {
        let parsing = () => parseCond("var == 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "==", val: "str" });
      });

      it("parses `var != 'str'`", () => {
        let parsing = () => parseCond("var != 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "!=", val: "str" });
      });

      it("parses `var == number`", () => {
        let parsing = () => parseCond("var == 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "==", val: 42 });
      });

      it("parses `var != number`", () => {
        let parsing = () => parseCond("var != 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "!=", val: 42 });
      });

      it("parses `var == true`", () => {
        let parsing = () => parseCond("var == true");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "==", val: true });
      });

      it("parses `var == false`", () => {
        let parsing = () => parseCond("var == false");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", eq: "==", val: false });
      });

      it("fails with invalid eq", () => {
        let parsing = () => parseCond("var = false");
        expect(parsing).to.throw();
      });

      it("fails with padding spaces", () => {
        let parsing = () => parseCond(" var == false ");
        expect(parsing).to.throw();
      });

      it("fails with no spaces", () => {
        let parsing = () => parseCond("var==false");
        expect(parsing).to.throw();
      });

      it("fails with nonconst val", () => {
        let parsing = () => parseCond("var == foo");
        expect(parsing).to.throw();
      });
    });

    describe("evaluating", () => {
      describe("`var`", () => {
        const parsed = parseCond("var");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(false);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: 0 }))).to.eq(false);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "foo" }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: "" }))).to.eq(false);
        });
      });

      describe("`var == 'str'`", () => {
        const parsed = parseCond("var == 'foo'");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(false);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: 0 }))).to.eq(false);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "foo" }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: "bar" }))).to.eq(false);
        });
      });

      describe("`var != 'str'`", () => {
        const parsed = parseCond("var != 'foo'");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(true);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: 0 }))).to.eq(true);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "foo" }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: "bar" }))).to.eq(true);
        });
      });

      describe("`var == number`", () => {
        const parsed = parseCond("var == 42");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(false);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 42 }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(false);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "42" }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: "bar" }))).to.eq(false);
        });
      });

      describe("`var != number`", () => {
        const parsed = parseCond("var != 42");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(true);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 42 }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(true);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "42" }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: "bar" }))).to.eq(true);
        });
      });

      describe("var == true", () => {
        const parsed = parseCond("var == true");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(true);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(false);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: 0 }))).to.eq(false);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "true" }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: "false" }))).to.eq(false);
        });
      });

      describe("`var == false`", () => {
        const parsed = parseCond("var == false");

        it("bool", () => {
          expect(evalCond(parsed, new Changes({ var: true }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: false }))).to.eq(true);
        });

        it("number", () => {
          expect(evalCond(parsed, new Changes({ var: 1 }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: 0 }))).to.eq(false);
        });

        it("str", () => {
          expect(evalCond(parsed, new Changes({ var: "true" }))).to.eq(false);
          expect(evalCond(parsed, new Changes({ var: "false" }))).to.eq(false);
        });
      });
    });
  });

  describe("assignments", () => {
    describe("parsing", () => {
      it("parses `var = 'str'`", () => {
        let parsing = () => parseAssign("var = 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", val: "str" });
      });

      it("parses `var = number`", () => {
        let parsing = () => parseAssign("var = 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", val: 42 });
      });

      it("parses `var = true`", () => {
        let parsing = () => parseAssign("var = true");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", val: true });
      });

      it("parses `var = false`", () => {
        let parsing = () => parseAssign("var = false");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql({ ref: "var", val: false });
      });

      it("fails with invalid eq", () => {
        let parsing = () => parseAssign("var == false");
        expect(parsing).to.throw();
      });

      it("fails with padding spaces", () => {
        let parsing = () => parseAssign(" var = false ");
        expect(parsing).to.throw();
      });

      it("fails with no spaces", () => {
        let parsing = () => parseAssign("var=false");
        expect(parsing).to.throw();
      });

      it("fails with nonconst val", () => {
        let parsing = () => parseAssign("var = foo");
        expect(parsing).to.throw();
      });
    });

    describe("evaluating", () => {
      it("evaluates var = 'str'", () => {
        let parsed = parseAssign("var = 'str'");
        let result = evalAssign(parsed);
        expect(result).to.eql({ var: "str" });
      });

      it("evaluates var = number", () => {
        let parsed = parseAssign("var = 42");
        let result = evalAssign(parsed);
        expect(result).to.eql({ var: 42 });
      });

      it("evaluates var = true", () => {
        let parsed = parseAssign("var = true");
        let result = evalAssign(parsed);
        expect(result).to.eql({ var: true });
      });

      it("evaluates var = false", () => {
        let parsed = parseAssign("var = false");
        let result = evalAssign(parsed);
        expect(result).to.eql({ var: false });
      });
    });
  });
});
