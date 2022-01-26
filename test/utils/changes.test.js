import { expect } from "@open-wc/testing";

import { Ref, Changes } from "../../src/utils/changes";

describe("refs", () => {

  describe("checking", () => {
    it("equal", () => {
      expect(Ref.includes("foo", "foo")).to.be.true;
      expect(Ref.includes("foo.bar", "foo.bar")).to.be.true;
    });

    it("nested", () => {
      expect(Ref.includes("foo", "foo.bar")).to.be.true;
      expect(Ref.includes("foo", "foo.bar.baz")).to.be.true;
      expect(Ref.includes("foo.bar", "foo.bar.baz")).to.be.true;
    });

    it("misplaced", () => {
      expect(Ref.includes("foo.bar", "foo")).to.be.false;
      expect(Ref.includes("foo.bar.baz", "foo.bar")).to.be.false;
    });

    it("mismatching", () => {
      expect(Ref.includes("foo1", "foo2")).to.be.false;
      expect(Ref.includes("foo.bar1", "foo.bar2")).to.be.false;
      expect(Ref.includes("foo.bar.baz1", "foo.bar.baz2")).to.be.false;
    });
  });

  describe("stripping", () => {
    it("equal", () => {
      expect(Ref.strip("foo", "foo")).to.eq("");
      expect(Ref.strip("foo.bar", "foo.bar")).to.eq("");
    });

    it("nested", () => {
      expect(Ref.strip("foo", "foo.bar")).to.eq("bar");
      expect(Ref.strip("foo", "foo.bar.baz")).to.eq("bar.baz");
      expect(Ref.strip("foo.bar", "foo.bar.baz")).to.eq("baz");
    });
  });

  describe("extracting", () => {
    it("fields", () => {
      expect(Ref.extract({ foo: { bar: { baz: "Baz" } } }, "foo.bar.baz")).to.eq("Baz");
    });

    it("subobjects", () => {
      expect(Ref.extract({ foo: { bar: { baz: "Baz" } } }, "foo.bar")).to.eql({ baz: "Baz" });
      expect(Ref.extract({ foo: { bar: { baz: "Baz" } } }, "foo")).to.eql({ bar: { baz: "Baz" } });
    });

    it("elems", () => {
      expect(Ref.extract({ foo: { bar: ["a", "b", "c"] } }, "foo.bar.1")).to.eql("b");
    });
  });

  describe("updating", () => {
    let data;

    it("changes field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      Ref.update(data, "foo.bar1", "Bar11");
      expect(data).to.eql({ foo: { bar1: "Bar11", bar2: "Bar2" } });
    });

    it("adds field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      Ref.update(data, "foo.bar3", "Bar3");
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } });
    });

    it("deletes field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } };
      Ref.update(data, "foo.bar3", undefined);
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2" } });
    });

    it("replaces obj", () => {
      data = { foo: { bar: { baz: "Baz" } } };
      Ref.update(data, "foo.bar", { baz2: "Baz2" });
      expect(data).to.eql({ foo: { bar: { baz2: "Baz2" } } });
    });

    it("adds obj", () => {
      data = { foo: { bar: { baz: "Baz" } } };
      Ref.update(data, "foo.bar2", { baz2: "Baz2" });
      expect(data).to.eql({ foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } });
    });

    it("deletes obj", () => {
      data = { foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } };
      Ref.update(data, "foo.bar2", undefined);
      expect(data).to.eql({ foo: { bar: { baz: "Baz" } } });
    });

    it("replaces elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      Ref.update(data, "foo.bar.1", "z");
      expect(data).to.eql({ foo: { bar: ["a", "z", "c"] } });
    });

    it("adds elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      Ref.update(data, "foo.bar.3", "z");
      expect(data).to.eql({ foo: { bar: ["a", "b", "c", "z"] } });
    });

    it("deletes elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      Ref.update(data, "foo.bar.1", undefined);
      expect(data).to.eql({ foo: { bar: ["a", undefined, "c"] } });
    });
  });
});

describe("changes", () => {
  let data, changes, ref;

  describe("creating", () => {
    it("from object", () => {
      changes = new Changes({ foo: "Foo" });
      expect(changes).to.eql(new Map([['foo', "Foo"]]));
    })

    it("from object with prefix", () => {
      changes = new Changes({ foo: "Foo" }, "prefix");
      expect(changes).to.eql(new Map([['prefix.foo', "Foo"]]));
    })
  });

  describe("checking and extracting", () => {
    it("does fld/fld", () => {
      changes = new Changes({ fld: "Foo" });
      ref = "fld";
      expect(changes.affects(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't fld2/fld1", () => {
      changes = new Changes({ fld2: "Foo" });
      ref = "fld1";
      expect(changes.affects(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("does obj.fld/obj.fld", () => {
      changes = new Changes({ "obj.fld": "Foo" });
      ref = "obj.fld";
      expect(changes.affects(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't obj.fld2/obj.fld1", () => {
      changes = new Changes({ "obj.fld2": "Foo" });
      ref = "obj.fld1";
      expect(changes.affects(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("doesn't obj2.fld/obj1.fld", () => {
      changes = new Changes({ "obj2.fld": "Foo" });
      ref = "obj1.fld";
      expect(changes.affects(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("does obj/obj.fld", () => {
      changes = new Changes({ obj: { fld: "Foo" } });
      ref = "obj.fld";
      expect(changes.affects(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("does obj.subobj/obj.subobj.fld", () => {
      changes = new Changes({ "obj.subobj": { fld: "Foo" } });
      ref = "obj.subobj.fld";
      expect(changes.affects(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("does obj/obj.subobj.fld", () => {
      changes = new Changes({ obj: { subobj: { fld: "Foo" } } });
      ref = "obj.subobj.fld";
      expect(changes.affects(ref)).to.be.true;
      expect(changes.pick(ref)).to.eq("Foo");
    });

    it("doesn't obj2/obj1.fld", () => {
      changes = new Changes({ obj2: { fld: "Foo" } });
      ref = "obj1.fld";
      expect(changes.affects(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });

    it("doesn't obj.fld/obj", () => {
      changes = new Changes({ "obj.fld": "Foo" });
      ref = "obj";
      expect(changes.affects(ref)).to.be.false;
      expect(() => changes.pick(ref)).to.throw;
    });
  });

  describe("patching fields", () => {
    it("changes field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      changes = new Changes({ "foo.bar1": "Bar11" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar11", bar2: "Bar2" } });
    });

    it("adds field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      changes = new Changes({ "foo.bar3": "Bar3" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } });
    });

    it("deletes field", () => {
      data = { foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } };
      changes = new Changes({ "foo.bar3": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2" } });
    });

    it("replaces obj", () => {
      data = { foo: { bar: { baz: "Baz" } } };
      changes = new Changes({ "foo.bar": { baz2: "Baz2" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz2: "Baz2" } } });
    });

    it("adds obj", () => {
      data = { foo: { bar: { baz: "Baz" } } };
      changes = new Changes({ "foo.bar2": { baz2: "Baz2" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } });
    });

    it("deletes obj", () => {
      data = { foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } };
      changes = new Changes({ "foo.bar2": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: "Baz" } } });
    });

    it("replaces elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      changes = new Changes({ "foo.bar.1": "z" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", "z", "c"] } });
    });

    it("adds elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      changes = new Changes({ "foo.bar.3": "z" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", "b", "c", "z"] } });
    });

    it("deletes elem", () => {
      data = { foo: { bar: ["a", "b", "c"] } };
      changes = new Changes({ "foo.bar.1": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", undefined, "c"] } });
    });
  });
});
