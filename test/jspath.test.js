import { expect } from "@open-wc/testing";

import { JSPath } from "../src/jspath";

describe("JSPath", () => {
  describe("parsing", () => {
    it("fails on empty", () => {
      expect(() => new JSPath("")).to.throw;
    });

    it("fails on no tail", () => {
      expect(() => new JSPath("foo.bar.")).to.throw;
    });

    it("fails on no head", () => {
      expect(() => new JSPath(".bar.baz")).to.throw;
    });

    it("fails on dot", () => {
      expect(() => new JSPath(".")).to.throw;
    });

    it("fails on bogus syntax", () => {
      expect(() => new JSPath("foo/bar")).to.throw;
    });

    it("parses single", () => {
      let jsp = new JSPath("foo");
      expect(jsp.length).to.eq(1);
    });

    it("parses chain", () => {
      let jsp = new JSPath("foo.bar.baz");
      expect(jsp.length).to.eq(3);
    });
  });

  describe("extracting", () => {
    const data = { foo: { bar: { baz: 123 } } };

    it("extracts single field", () => {
      let jsp = new JSPath("foo");
      expect(jsp.extract(data)).to.deep.eq({ bar: { baz: 123 } });
    });

    it("extracts nested field", () => {
      let jsp = new JSPath("foo.bar.baz");
      expect(jsp.extract(data)).to.eq(123);
    });

    it("extracts missing single field", () => {
      let jsp = new JSPath("fooXXX");
      expect(jsp.extract(data)).to.eq(undefined);
    });

    it("extracts missing nested field", () => {
      let jsp = new JSPath("foo.bar.bazXXX");
      expect(jsp.extract(data)).to.eq(undefined);
    });

    it("extracts missing subobj", () => {
      let jsp = new JSPath("foo.barXXX.baz");
      expect(jsp.extract(data)).to.eq(undefined);
    });
  });

  describe("expanding", () => {
    it("expands single field", () => {
      let jsp = new JSPath("foo");
      expect(jsp.expand("Foo")).to.eql({ foo: "Foo" });
    });

    it("expands nested field", () => {
      let jsp = new JSPath("foo.bar.baz");
      expect(jsp.expand("Baz")).to.eql({ foo: { bar: { baz: "Baz" } } });
    });
  });

  describe("updating", () => {
    it("modifies single field", () => {
      const data = {
        foo1: 1,
        foo2: 2,
        foo3: 3,
      };

      let jsp = new JSPath("foo2");
      jsp.update(data, "foo2");
      expect(data).to.eql({
        foo1: 1,
        foo2: "foo2",
        foo3: 3,
      });
    });

    it("adds single field", () => {
      const data = {
        foo1: 1,
        foo2: 2,
        foo3: 3,
      };

      let jsp = new JSPath("foo4");
      jsp.update(data, "foo4");
      expect(data).to.eql({
        foo1: 1,
        foo2: 2,
        foo3: 3,
        foo4: "foo4",
      });
    });

    it("modifies nested field", () => {
      const data = {
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: 21, bar2: 22 },
      };

      let jsp = new JSPath("foo2.bar1");
      jsp.update(data, "foobar");
      expect(data).to.eql({
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: "foobar", bar2: 22 },
      });
    });

    it("adds nested field", () => {
      const data = {
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: 21, bar2: 22 },
      };

      let jsp = new JSPath("foo2.bar3");
      jsp.update(data, "foobar");
      expect(data).to.eql({
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: 21, bar2: 22, bar3: "foobar" },
      });
    });

    it("adds nested obj", () => {
      const data = {
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: 21, bar2: 22 },
      };

      let jsp = new JSPath("foo3.bar1");
      jsp.update(data, "foobar");
      expect(data).to.eql({
        foo1: { bar1: 11, bar2: 12 },
        foo2: { bar1: 21, bar2: 22 },
        foo3: { bar1: "foobar" },
      });
    });
  });
});
