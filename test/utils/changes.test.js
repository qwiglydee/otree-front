import { expect } from "@open-wc/testing";

import { Changes } from "../../src/utils/changes";

describe("changes", () => {
  describe("creating", () => {
    it("creates map", () => {
      expect(new Changes({ foo: "Foo", bar: "Bar" })).to.eql(
        new Map([
          ["foo", "Foo"],
          ["bar", "Bar"],
        ])
      );
    });

    it("checks keys", () => {
      expect(() => new Changes({ "obj[foo]": "Foo" })).to.throw();
    });
  });

  describe("checking", () => {
    it("has", () => {
      // it's underlying Map api
      let ch = new Changes({ "foo.bar": { baz: "Baz" } });
      expect(ch.has("foo")).to.be.false;
      expect(ch.has("foo.bar")).to.be.true;
      expect(ch.has("foo.bar.baz")).to.be.false;
      expect(ch.has("foo.bar.baz.qux")).to.be.false;
      expect(ch.has("foo.bar.qux")).to.be.false;
      expect(ch.has("other")).to.be.false;
    });

    it("affects nested", () => {
      let ch = new Changes({ "foo.bar": { baz: "Baz" } });
      expect(ch.affects("foo")).to.be.false;
      expect(ch.affects("foo.bar")).to.be.true;
      expect(ch.affects("foo.bar.baz")).to.be.true;
      expect(ch.affects("foo.bar.baz.qux")).to.be.true;
      expect(ch.affects("foo.bar.qux")).to.be.true;
      expect(ch.affects("other")).to.be.false;
    });

    it("affects parents", () => {
      let ch = new Changes({ "foo.bar": { baz: "Baz" } });
      expect(ch.affects("foo.*")).to.be.true;
      expect(ch.affects("foo.bar.*")).to.be.true;
      expect(ch.affects("foo.bar.baz.*")).to.be.false;
      expect(ch.affects("foo.bar.qux.*")).to.be.false;
    });

    it("affects arrays", () => {
      let ch = new Changes({ foo: [1, 2, 3] });
      expect(ch.affects("foo")).to.be.true;
      expect(ch.affects("foo.1")).to.be.true;
    });

    it("affects array elems", () => {
      let ch = new Changes({ "foo.1": 2 });
      expect(ch.affects("foo.*")).to.be.true;
      expect(ch.affects("foo.1")).to.be.true;
    });
  });

  describe("picking", () => {
    let ch = new Changes({ "foo.bar": { baz: "Baz" }, "foo.bar2": { baz: { qux: "Qux" } }, arr: [1, 2, 3] });

    it("direct", () => {
      expect(ch.pick("foo.bar2")).to.eql({ baz: {qux: "Qux" }});
    });

    it("parent", () => {
      expect(ch.pick("foo")).to.eql({ bar: { baz: "Baz" }, bar2: { baz: { qux: "Qux" }}});
    });

    it("splitted", () => {
      expect(ch.pick("foo.bar2.baz.qux")).to.eql("Qux");
    });

    it("array elem", () => {
      expect(ch.pick("arr.1")).to.eql(2);
    });

  });

  describe("patching", () => {
    it("changes field", () => {
      let data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      let changes = new Changes({ "foo.bar1": "Bar11" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar11", bar2: "Bar2" } });
    });

    it("adds field", () => {
      let data = { foo: { bar1: "Bar1", bar2: "Bar2" } };
      let changes = new Changes({ "foo.bar3": "Bar3" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } });
    });

    it("deletes field", () => {
      let data = { foo: { bar1: "Bar1", bar2: "Bar2", bar3: "Bar3" } };
      let changes = new Changes({ "foo.bar3": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar1: "Bar1", bar2: "Bar2" } });
    });

    it("replaces obj", () => {
      let data = { foo: { bar: { baz: "Baz" } } };
      let changes = new Changes({ "foo.bar": { baz2: "Baz2" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz2: "Baz2" } } });
    });

    it("adds obj", () => {
      let data = { foo: { bar: { baz: "Baz" } } };
      let changes = new Changes({ "foo.bar2": { baz2: "Baz2" } });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } });
    });

    it("deletes obj", () => {
      let data = { foo: { bar: { baz: "Baz" }, bar2: { baz2: "Baz2" } } };
      let changes = new Changes({ "foo.bar2": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: { baz: "Baz" } } });
    });

    it("replaces elem", () => {
      let data = { foo: { bar: ["a", "b", "c"] } };
      let changes = new Changes({ "foo.bar.1": "z" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", "z", "c"] } });
    });

    it("adds elem", () => {
      let data = { foo: { bar: ["a", "b", "c"] } };
      let changes = new Changes({ "foo.bar.3": "z" });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", "b", "c", "z"] } });
    });

    it("deletes elem", () => {
      let data = { foo: { bar: ["a", "b", "c"] } };
      let changes = new Changes({ "foo.bar.1": undefined });
      changes.patch(data);
      expect(data).to.eql({ foo: { bar: ["a", undefined, "c"] } });
    });
  });
});
