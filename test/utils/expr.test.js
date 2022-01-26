import { expect } from "@open-wc/testing";

import { parseVar, parseCond, evalCond } from "../../src/utils/expr";

describe("expressions", () => {
  describe("parsing", () => {
    describe("references `var`", () => {
      it("parses `var`", () => {
        let parsing = () => parseVar("var");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eq("var");
      });

      it("fails on padding spaces", () => {
        let parsing = () => parseVar(" var ");
        expect(parsing).to.throw();
      });

      it("fails on cond expressions", () => {
        let parsing = () => parseVar("var == 'val'");
        expect(parsing).to.throw();
      });
    });

    describe("references `obj.fld`", () => {
      it("parses `obj.fld`", () => {
        let parsing = () => parseVar("obj.fld");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eq("obj.fld");
      });

      it("fails on padding spaces", () => {
        let parsing = () => parseVar(" obj.fld ");
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

      it("fails on cond expressions", () => {
        let parsing = () => parseVar("obj.fld == 'val'");
        expect(parsing).to.throw();
      });
    });

    describe("conditionals `var`", () => {
      it("parses `var`", () => {
        let parsing = () => parseCond("var");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", undefined, undefined]);
      });

      it("parses `var == 'str'`", () => {
        let parsing = () => parseCond("var == 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "==", "str"]);
      });

      it("parses `var != 'str'`", () => {
        let parsing = () => parseCond("var != 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "!=", "str"]);
      });

      it("parses `var == number`", () => {
        let parsing = () => parseCond("var == 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "==", 42]);
      });

      it("parses `var != number`", () => {
        let parsing = () => parseCond("var != 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "!=", 42]);
      });

      it("parses `var == true`", () => {
        let parsing = () => parseCond("var == true");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "==", true]);
      });

      it("parses `var == false`", () => {
        let parsing = () => parseCond("var == false");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["var", "==", false]);
      });

      it("fails with invalid eq", () => {
        let parsing = () => parseCond("var = false");
        expect(parsing).to.throw();
      });

      it("fails with padding spaces", () => {
        let parsing = () => parseCond(" var == false ");
        expect(parsing).to.throw();
      });

      it("fails without spaces", () => {
        let parsing = () => parseCond("var==false");
        expect(parsing).to.throw();
      });

      it("fails with nonconst val", () => {
        let parsing = () => parseCond("var == foo");
        expect(parsing).to.throw();
      });
    });

    describe("conditionals `obj.fld`", () => {
      it("parses `obj.fld`", () => {
        let parsing = () => parseCond("obj.fld");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", undefined, undefined]);
      });

      it("parses `obj.fld == 'str'`", () => {
        let parsing = () => parseCond("obj.fld == 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "==", "str"]);
      });

      it("parses `obj.fld != 'str'`", () => {
        let parsing = () => parseCond("obj.fld != 'str'");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "!=", "str"]);
      });

      it("parses `obj.fld == number`", () => {
        let parsing = () => parseCond("obj.fld == 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "==", 42]);
      });

      it("parses `obj.fld != number`", () => {
        let parsing = () => parseCond("obj.fld != 42");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "!=", 42]);
      });

      it("parses `obj.fld == true`", () => {
        let parsing = () => parseCond("obj.fld == true");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "==", true]);
      });

      it("parses `obj.fld == false`", () => {
        let parsing = () => parseCond("obj.fld == false");
        expect(parsing).not.to.throw();
        expect(parsing()).to.eql(["obj.fld", "==", false]);
      });

      it("fails with invalid eq", () => {
        let parsing = () => parseCond("obj.fld = false");
        expect(parsing).to.throw();
      });

      it("fails with padding spaces", () => {
        let parsing = () => parseCond(" obj.fld == false ");
        expect(parsing).to.throw();
      });

      it("fails without spaces", () => {
        let parsing = () => parseCond("obj.fld==false");
        expect(parsing).to.throw();
      });

      it("fails with nonconst val", () => {
        let parsing = () => parseCond("obj.fld == foo");
        expect(parsing).to.throw();
      });
    });
  });

  describe("evaluating conditionals", () => {
    describe("`var`", () => {
      const [ref, eq, val] = parseCond("var");

      it("bool", () => {
        expect(evalCond(true, eq, val)).to.eq(true);
        expect(evalCond(false, eq, val)).to.eq(false);
      });

      it("number", () => {
        expect(evalCond(1, eq, val)).to.eq(true);
        expect(evalCond(0, eq, val)).to.eq(false);
      });

      it("str", () => {
        expect(evalCond("foo", eq, val)).to.eq(true);
        expect(evalCond("", eq, val)).to.eq(false);
      });
    });

    describe("var == 'str'", () => {
      const [ref, eq, val] = parseCond("var == 'foo'");

      it("bool", () => {
        expect(evalCond(true, eq, val)).to.eq(false);
        expect(evalCond(false, eq, val)).to.eq(false);
      });

      it("number", () => {
        expect(evalCond(1, eq, val)).to.eq(false);
        expect(evalCond(0, eq, val)).to.eq(false);
      });

      it("str", () => {
        expect(evalCond("foo", eq, val)).to.eq(true);
        expect(evalCond("bar", eq, val)).to.eq(false);
      });
    });

    describe("var == number", () => {
      const [ref, eq, val] = parseCond("var == 42");

      it("bool", () => {
        expect(evalCond(true, eq, val)).to.eq(false);
        expect(evalCond(false, eq, val)).to.eq(false);
      });

      it("number", () => {
        expect(evalCond(42, eq, val)).to.eq(true);
        expect(evalCond(1, eq, val)).to.eq(false);
      });

      it("str", () => {
        expect(evalCond("42", eq, val)).to.eq(false);
        expect(evalCond("bar", eq, val)).to.eq(false);
      });
    });

    describe("var == true", () => {
      const [ref, eq, val] = parseCond("var == true");

      it("bool", () => {
        expect(evalCond(true, eq, val)).to.eq(true);
        expect(evalCond(false, eq, val)).to.eq(false);
      });

      it("number", () => {
        expect(evalCond(1, eq, val)).to.eq(false);
        expect(evalCond(0, eq, val)).to.eq(false);
      });

      it("str", () => {
        expect(evalCond("true", eq, val)).to.eq(false);
        expect(evalCond("false", eq, val)).to.eq(false);
      });
    });

    describe("var == false", () => {
      const [ref, eq, val] = parseCond("var == false");

      it("bool", () => {
        expect(evalCond(true, eq, val)).to.eq(false);
        expect(evalCond(false, eq, val)).to.eq(true);
      });

      it("number", () => {
        expect(evalCond(1, eq, val)).to.eq(false);
        expect(evalCond(0, eq, val)).to.eq(false);
      });

      it("str", () => {
        expect(evalCond("true", eq, val)).to.eq(false);
        expect(evalCond("false", eq, val)).to.eq(false);
      });
    });

  });
});
