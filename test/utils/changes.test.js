import { expect } from "@open-wc/testing";

import { Ref, Changes } from "../../src/utils/changes";

describe("Ref", () => {
  describe("parsing", () => {
    it("fails on empty", () => {
      expect(() => new Ref("")).to.throw;
    });

    it("fails on dot", () => {
      expect(() => new Ref(".")).to.throw;
    });

    it("fails on digits", () => {
      expect(() => new Ref("1.2.3")).to.throw;
    });

    it("fails on no tail", () => {
      expect(() => new Ref("foo.bar.")).to.throw;
    });

    it("fails on no head", () => {
      expect(() => new Ref(".bar.baz")).to.throw;
    });

    it("fails on bogus syntax", () => {
      expect(() => new Ref("foo/bar")).to.throw;
    });

    it("parses single", () => {
      let ref = new Ref("foo");
      expect(ref.length).to.eq(1);
    });

    it("parses chain", () => {
      let ref = new Ref("foo.bar.baz");
      expect(ref.length).to.eq(3);
    });
  });

  describe("matching parent/nested", () => {
    it("does fld/fld", () => {
      let ref = new Ref("fld"),
        parent = new Ref("fld");
      expect(parent.includes(ref)).to.be.true;
      expect(parent.strip(ref)).to.be.null;
    });

    it("doesn't fld2/fld1", () => {
      let ref = new Ref("foo1"),
        parent = new Ref("foo2");
      expect(parent.includes(ref)).to.be.false;
      expect(() => parent.strip(ref)).to.throw;
    });

    it("does obj.fld/obj.fld", () => {
      let ref = new Ref("obj.fld"),
        parent = new Ref("obj.fld");
      expect(parent.includes(ref)).to.be.true;
      expect(parent.strip(ref)).to.be.null;
    });

    it("doesn't obj.fld2/obj.fld1", () => {
      let ref = new Ref("obj.foo1"),
        parent = new Ref("obj.foo2");
      expect(parent.includes(ref)).to.be.false;
      expect(() => parent.strip(ref)).to.throw;
    });

    it("doesn't obj2.fld/obj1.fld", () => {
      let ref = new Ref("bar1.fld"),
        parent = new Ref("bar2.fld");
      expect(parent.includes(ref)).to.be.false;
      expect(() => parent.strip(ref)).to.throw;
    });

    it("does obj/obj.fld", () => {
      let ref = new Ref("obj.fld"),
        parent = new Ref("obj");
      expect(parent.includes(ref)).to.be.true;
      expect(parent.strip(ref)).to.eql(new Ref("fld"));
    });

    it("doesn't obj2/obj1.fld", () => {
      let ref = new Ref("bar1.fld"),
        parent = new Ref("bar2");
      expect(parent.includes(ref)).to.be.false;
      expect(() => parent.strip(ref)).to.throw;
    });

    it("doesn't obj.fld/obj", () => {
      let ref = new Ref("obj"),
        parent = new Ref("obj.fld");
      expect(parent.includes(ref)).to.be.false;
      expect(() => parent.strip(ref)).to.throw;
    });
  });

  describe("extracting", () => {
    const data = { foo: { bar: { baz: 123 } } };

    it("nested field", () => {
      let ref = new Ref("foo.bar.baz");
      expect(ref.extract(data)).to.eq(123);
    });

    it("nested obj", () => {
      let ref = new Ref("foo.bar");
      expect(ref.extract(data)).to.eql({ baz: 123 });
    });

    it("top obj", () => {
      let ref = new Ref("foo");
      expect(ref.extract(data)).to.eql({ bar: { baz: 123 } });
    });

    it("missing nested field", () => {
      let ref = new Ref("foo.bar.baz2");
      expect(ref.extract(data)).to.be.undefined;
    });

    it("missing nested obj", () => {
      let ref = new Ref("foo.bar2");
      expect(ref.extract(data)).to.be.undefined;
    });

    it("missing top obj", () => {
      let ref = new Ref("foo2");
      expect(ref.extract(data)).to.be.undefined;
    });
  });

  describe("updating", () => {
    let data;

    beforeEach(() => {
      data = { foo: { bar: { baz: 123 } } };
    });

    it("nested field", () => {
      let ref = new Ref("foo.bar.baz");
      ref.update(data, "ABC");
      expect(data).to.eql({ foo: { bar: { baz: "ABC" } } });
    });

    it("nested obj", () => {
      let ref = new Ref("foo.bar");
      ref.update(data, { qux: "ABC" });
      expect(data).to.eql({ foo: { bar: { qux: "ABC" } } });
    });

    it("top obj", () => {
      let ref = new Ref("foo");
      ref.update(data, { bar: { qux: "ABC" } });
      expect(data).to.eql({ foo: { bar: { qux: "ABC" } } });
    });

    it("missing nested field", () => {
      let ref = new Ref("foo.bar.baz2");
      ref.update(data, "ABC");
      expect(data).to.eql({ foo: { bar: { baz: 123, baz2: "ABC" } } });
    });

    it("missing nested obj", () => {
      let ref = new Ref("foo.bar2");
      ref.update(data, { qux: "ABC" });
      expect(data).to.eql({ foo: { bar: { baz: 123 }, bar2: { qux: "ABC" } } });
    });

    it("missing top obj", () => {
      let ref = new Ref("foo2");
      ref.update(data, { bar2: { qux: "ABC" } });
      expect(data).to.eql({ foo: { bar: { baz: 123 } }, foo2: { bar2: { qux: "ABC" } } });
    });
  });
});

describe("changes", () => {

  describe("initializing", () => {
    it("from obj", () => {
      let changes = new Changes({ foo: "Foo", bar: "Bar" });
      expect([...changes.keys()]).to.eql([new Ref("foo"), new Ref("bar")]);
    });

    it("from obj of refs", () => {
      let changes = new Changes({ [new Ref("foo")]: "Foo", [new Ref("bar")]: "Bar" });
      expect([...changes.keys()]).to.eql([new Ref("foo"), new Ref("bar")]);
    });

    it("from array", () => {
      let changes = new Changes([
        ["foo", "Foo"],
        ["bar", "Bar"],
      ]);
      expect([...changes.keys()]).to.eql([new Ref("foo"), new Ref("bar")]);
    });

    it("from array of refs", () => {
      let changes = new Changes([
        [new Ref("foo"), "Foo"],
        [new Ref("bar"), "Bar"],
      ]);
      expect([...changes.keys()]).to.eql([new Ref("foo"), new Ref("bar")]);
    });

  });

  describe("updating vars changes/ref", () => {
    it("does fld/fld", () => {
      let ref = new Ref("fld"),
        changes = new Changes({ fld: "Foo" });
      expect(changes.affect(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't fld2/fld1", () => {
      let ref = new Ref("fld1"),
        changes = new Changes({ fld2: "Foo" });
      expect(changes.affect(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("does obj.fld/obj.fld", () => {
      let ref = new Ref("obj.fld"),
        changes = new Changes({ "obj.fld": "Foo" });
      expect(changes.affect(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't obj.fld2/obj.fld1", () => {
      let ref = new Ref("obj.fld1"),
        changes = new Changes({ "obj.fld2": "Foo" });
      expect(changes.affect(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("doesn't obj2.fld/obj1.fld", () => {
      let ref = new Ref("obj1.fld"),
        changes = new Changes({ "obj2.fld": "Foo" });
      expect(changes.affect(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("does obj/obj.fld", () => {
      let ref = new Ref("obj.fld"),
        changes = new Changes({ obj: { fld: "Foo" } });
      expect(changes.affect(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't obj2/obj1.fld", () => {
      let ref = new Ref("obj1.fld"),
        changes = new Changes({ obj2: { fld: "Foo" } });
      expect(changes.affect(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("doesn't obj.fld/obj", () => {
      let ref = new Ref("obj"),
        changes = new Changes({ "obj.fld": "Foo" });
      expect(changes.affect(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });
  });

  describe("patching data", () => {
    let data;

    beforeEach(() => {
      data = { foo: { bar: { baz: 123, bax: 456 } } };
    });

    it("changes fld", () => {
      let changes = new Changes({ "foo.bar.baz": "ABC" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: "ABC", bax: 456 } } });
    });

    it("changes obj", () => {
      let changes = new Changes({ "foo.bar": { qux: "ABC" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { qux: "ABC" } } });
    });

    it("adds fld", () => {
      let changes = new Changes({ "foo.bar.qux": "ABC" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: 123, bax: 456, qux: "ABC" } } });
    });

    it("adds obj", () => {
      let changes = new Changes({ "foo.bar2": { qux: "ABC" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: 123, bax: 456 }, bar2: { qux: "ABC" } } });
    });

    it("deletes fld", () => {
      let changes = new Changes({ "foo.bar.baz": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { bax: 456 } } });
    });

    it("deletes obj", () => {
      let changes = new Changes({ "foo.bar": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: {} });
    });
  });
});
