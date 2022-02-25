import { expect } from "@open-wc/testing";

import * as ref from "../../src/utils/ref";

describe("ref", () => {
  it("checks isparent", () => {
    expect(ref.isparentRef("foo", "foo")).to.be.false;
    expect(ref.isparentRef("foo", "foo.bar")).to.be.true;
    expect(ref.isparentRef("foo", "foobar")).to.be.false;
    expect(ref.isparentRef("foo", "foo.bar.baz")).to.be.true;
    expect(ref.isparentRef("foo.bar", "foo")).to.be.false;
    expect(ref.isparentRef("foo.bar", "foo.bar")).to.be.false;
    expect(ref.isparentRef("foo.bar", "foo.bar.baz")).to.be.true;
  });

  it("gets nested path", () => {
    expect(ref.getsubRef("foo", "foo")).to.be.eq("");
    expect(ref.getsubRef("foo", "foo.bar")).to.be.eq("bar");
    expect(ref.getsubRef("foo", "foo.bar.baz")).to.be.eq("bar.baz");
    expect(ref.getsubRef("foo.bar", "foo.bar")).to.be.eq("");
    expect(ref.getsubRef("foo.bar", "foo.bar.baz")).to.be.eq("baz");
  });

  it("fails to get incompatible nested path", () => {
    expect(() => ref.getsubRef("foo", "foobar")).to.throw();
    expect(() => ref.getsubRef("foo.bar", "foo")).to.throw();
  });

  it("gets common top path", () => {
    expect(ref.gettopRef("foo", "foo.bar")).to.be.eq("foo");
    expect(ref.gettopRef("foo.bar", "foo.baz")).to.be.eq("foo");
    expect(ref.gettopRef("foo.bar", "foo.bar.baz")).to.be.eq("foo.bar");
    expect(ref.gettopRef("foo.bar.qux", "foo.bar.baz")).to.be.eq("foo.bar");
  });

  it("extracts from object", () => {
    let obj = { foo: { bar: { baz: "Baz" } } };
    expect(ref.extractByRef("foo", obj)).to.eql({ bar: { baz: "Baz" } });
    expect(ref.extractByRef("foo.bar", obj)).to.eql({ baz: "Baz" });
    expect(ref.extractByRef("foo.bar.baz", obj)).to.eql("Baz");
    expect(ref.extractByRef("bar", obj)).to.be.undefined;
    expect(ref.extractByRef("baz", obj)).to.be.undefined;
  });

  it("updates object", () => {
    let obj = { foo: { bar: "Bar" } };
    ref.updateByRef("foo.bar", obj, "new");
    expect(obj).to.eql({ foo: { bar: "new" } });
  });

  it("inserts subobjets", () => {
    let obj = { foo: { bar: "Bar" } };
    ref.updateByRef("foo.baz.qux", obj, "new");
    expect(obj).to.eql({ foo: { bar: "Bar", baz: { qux: "new" } }});
  });
});
