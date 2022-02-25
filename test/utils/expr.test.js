import { expect } from "@open-wc/testing";

import { Changes } from "../../src/utils/changes";
import { parseExpr, VarExpr, CmpExpr, InpExpr } from "../../src/utils/expr";

function aResetEvent(vars) {
  return new CustomEvent("ot.reset", { detail: vars });
}

function anUpdateEvent(changes) {
  return new CustomEvent("ot.update", { detail: new Changes(changes) });
}

function anInputEvent(name, value = "xxx") {
  return new CustomEvent("ot.input", { detail: { name, value } });
}

describe("expressions", () => {
  describe("VarExpr", () => {
    describe("parsing", () => {
      it("parses `var`", () => {
        let expr = parseExpr("var");
        expect(expr).to.be.instanceOf(VarExpr);
        expect(expr).to.be.eql({ ref: "var" });
      });

      it("parses `obj.fld`", () => {
        let expr = parseExpr("obj.fld");
        expect(expr).to.be.instanceOf(VarExpr);
        expect(expr).to.be.eql({ ref: "obj.fld" });
      });

      it("fails on padding spaces", () => {
        expect(() => parseExpr(" var ")).to.throw();
      });

      it("fails on extra spaces", () => {
        expect(() => parseExpr("obj . fld")).to.throw();
      });

      it("fails on invalid chars", () => {
        expect(() => parseExpr("obj[fld]")).to.throw();
      });
    });

    describe("evaluating", () => {
      it("by global resetting var", () => {
        let expr = parseExpr("var"),
          event = aResetEvent();
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.undefined;
      });

      it("by global resetting obj.fld", () => {
        let expr = parseExpr("obj.fld"),
          event = aResetEvent();
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.undefined;
      });

      it("by resetting specific var", () => {
        let expr = parseExpr("var"),
          event = aResetEvent(["var"]);
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.undefined;
      });

      it("not by resetting another var", () => {
        let expr = parseExpr("var"),
          event = aResetEvent(["anothervar"]);
        expect(expr.affected(event)).false;
      });

      it("by resetting specific fld", () => {
        let expr = parseExpr("obj.fld"),
          event = aResetEvent(["obj.fld"]);
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.undefined;
      });

      it("not by resetting another fld", () => {
        let expr = parseExpr("obj.fld"),
          event = aResetEvent(["obj.anotherfld"]);
        expect(expr.affected(event)).false;
      });

      it("by resetting specific obj", () => {
        let expr = parseExpr("obj.fld"),
          event = aResetEvent(["obj"]);
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.undefined;
      });

      it("not by resetting another obj", () => {
        let expr = parseExpr("obj.fld"),
          event = aResetEvent(["anotherobj"]);
        expect(expr.affected(event)).false;
      });

      it("by updating var", () => {
        let expr = parseExpr("var"),
          event = anUpdateEvent({ var: "foo" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("foo");
      });

      it("not by updating another var", () => {
        let expr = parseExpr("var"),
          event = anUpdateEvent({ anothervar: "foo" });
        expect(expr.affected(event)).false;
      });

      it("by updating fld", () => {
        let expr = parseExpr("obj.fld"),
          event = anUpdateEvent({ "obj.fld": "foo" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("foo");
      });

      it("not by updating another fld", () => {
        let expr = parseExpr("obj.fld"),
          event = anUpdateEvent({ "obj.anotherfld": "foo" });
        expect(expr.affected(event)).false;
      });

      it("by updating obj", () => {
        let expr = parseExpr("obj.fld"),
          event = anUpdateEvent({ obj: { fld: "foo" } });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("foo");
      });

      it("not by updating another obj", () => {
        let expr = parseExpr("obj.fld"),
          event = anUpdateEvent({ anotherobj: {} });
        expect(expr.affected(event));
      });

      it("by updating array", () => {
        let expr = parseExpr("arr.2"),
          event = anUpdateEvent({ arr: ["a", "b", "c", "d"] });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("c");
      });

      it("by updating array elem", () => {
        let expr = parseExpr("arr.2"),
          event = anUpdateEvent({ "arr.2": "c" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("c");
      });

      it("by inputting var", () => {
        let expr = parseExpr("var"),
          event = anInputEvent("var", "foo");
        expect(expr.affected(event));
        expect(expr.eval(event)).to.eq("foo");
      });

      it("not by inputting another var", () => {
        let expr = parseExpr("var"),
          event = anInputEvent("anothervar");
        expect(expr.affected(event)).false;
      });

      it("by inputting fld", () => {
        let expr = parseExpr("obj.fld"),
          event = anInputEvent("obj.fld", "foo");
          expect(expr.affected(event));
          expect(expr.eval(event)).to.eq("foo");
      });

      it("not by inputting another fld", () => {
        let expr = parseExpr("obj.fld"),
          event = anInputEvent("obj.anotherfld", "foo");
          expect(expr.affected(event)).false;
      });

      it("by inputting obj", () => {
        let expr = parseExpr("obj.fld"),
          event = anInputEvent("obj", { fld: "foo" });
          expect(expr.affected(event));
          expect(expr.eval(event)).to.eq("foo");
      });

      it("not by inputting another obj", () => {
        let expr = parseExpr("obj.fld"),
          event = anInputEvent("anotherobj", { fld: "foo" });
          expect(expr.affected(event)).false;
      });
    });

  });

  describe("CmpExpr", () => {
    describe("parsing", () => {
      it("parses var == 'str'", () => {
        let expr = parseExpr("var == 'foo'");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "==", arg: "foo" });
      });

      it("parses var != 'str'", () => {
        let expr = parseExpr("var != 'foo'");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "!=", arg: "foo" });
      });

      it("parses var == 42", () => {
        let expr = parseExpr("var == 42");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "==", arg: 42 });
      });

      it("parses var != 42", () => {
        let expr = parseExpr("var != 42");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "!=", arg: 42 });
      });

      it("parses var == true", () => {
        let expr = parseExpr("var == true");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "==", arg: true });
      });

      it("parses var == false", () => {
        let expr = parseExpr("var == false");
        expect(expr).to.be.instanceOf(CmpExpr);
        expect(expr).to.be.eql({ ref: "var", op: "==", arg: false });
      });

      it("fails on invalid const", () => {
        expect(() => parseExpr("var == xxx")).to.throw();
      });

      it("fails on no spaces", () => {
        expect(() => parseExpr("var==true")).to.throw();
      });

      it("fails on extra spaces", () => {
        expect(() => parseExpr("var  ==  true")).to.throw();
      });

      it("fails on padding spaces", () => {
        expect(() => parseExpr(" var == true ")).to.throw();
      });

      it("fails on invalid chars", () => {
        expect(() => parseExpr("var < true")).to.throw();
      });
    });

    describe("evaluating", () => {
      it("by global resetting var == val", () => {
        let expr = parseExpr("var == 'foo'"),
          event = aResetEvent();
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by resetting specific var == val", () => {
        let expr = parseExpr("var == 'foo'"),
          event = aResetEvent(["var"]);
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by global resetting var == false", () => {
        let expr = parseExpr("var == false"),
          event = aResetEvent();
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by resetting specific var == false", () => {
        let expr = parseExpr("var == false"),
          event = aResetEvent(["var"]);
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by updating var == val with val", () => {
        let expr = parseExpr("var == 'foo'"),
          event = anUpdateEvent({ var: "foo" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.true;
      });

      it("by updating var == val with another val", () => {
        let expr = parseExpr("var == 'foo'"),
          event = anUpdateEvent({ var: "bar" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by updating var != val with val", () => {
        let expr = parseExpr("var != 'foo'"),
          event = anUpdateEvent({ var: "foo" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.false;
      });

      it("by updating var != val with another val", () => {
        let expr = parseExpr("var != 'foo'"),
          event = anUpdateEvent({ var: "bar" });
        expect(expr.affected(event));
        expect(expr.eval(event)).to.be.true;
      });

      it("not by updating another var == val with val", () => {
        let expr = parseExpr("var == 'foo'"),
          event = anUpdateEvent({ var2: "foo" });
        expect(expr.affected(event)).false;
      });
    });
  });

  describe("InpExpr", () => {
    describe("parsing", () => {
      it("parses var = 'str'", () => {
        let expr = parseExpr("var = 'foo'");
        expect(expr).to.be.instanceOf(InpExpr);
        expect(expr).to.be.eql({ ref: "var", val: "foo" });
      });

      it("parses var = 42", () => {
        let expr = parseExpr("var = 42");
        expect(expr).to.be.instanceOf(InpExpr);
        expect(expr).to.be.eql({ ref: "var", val: 42 });
      });

      it("parses var = true", () => {
        let expr = parseExpr("var = true");
        expect(expr).to.be.instanceOf(InpExpr);
        expect(expr).to.be.eql({ ref: "var", val: true });
      });

      it("parses var = false", () => {
        let expr = parseExpr("var = false");
        expect(expr).to.be.instanceOf(InpExpr);
        expect(expr).to.be.eql({ ref: "var", val: false });
      });

      it("fails on invalid const", () => {
        expect(() => parseExpr("var == xxx")).to.throw();
      });

      it("fails on no spaces", () => {
        expect(() => parseExpr("var=true")).to.throw();
      });

      it("fails on extra spaces", () => {
        expect(() => parseExpr("var  =  true")).to.throw();
      });

      it("fails on padding spaces", () => {
        expect(() => parseExpr(" var = true ")).to.throw();
      });
    });
  });
});
