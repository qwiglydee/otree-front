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

  if("gets nested path", () => {
    expect(ref.getsubRef("foo", "foo")).to.be.eq("");
    expect(ref.getsubRef("foo", "foo.bar")).to.be.eq("bar");
    expect(ref.getsubRef("foo", "foobar")).to.be.undefined;
    expect(ref.getsubRef("foo", "foo.bar.baz")).to.be.eq("bar.baz");
    expect(ref.getsubRef("foo.bar", "foo")).to.be.undefined;
    expect(ref.getsubRef("foo.bar", "foo.bar")).to.be.eq("");
    expect(ref.getsubRef("foo.bar", "foo.bar.baz")).to.be.eq("baz");
  });

  if("gets common top path", () => {
    expect(ref.gettopRef("foo", "foo.bar")).to.be.eq("foo");
    expect(ref.gettopRef("foo.bar", "foo.baz")).to.be.eq("foo");
    expect(ref.gettopRef("foo.bar", "foo.bar.baz")).to.be.eq("foo.bar");
    expect(ref.gettopRef("foo.bar.qux", "foo.bar.baz")).to.be.eq("foo.bar");
  });

  it("extracts from object", () => {
    let obj = {foo:{bar:{baz:"Baz"}}};
    expect(ref.extractByRef("foo", obj)).to.eql({bar:{baz:"Baz"}});
    expect(ref.extractByRef("foo.bar", obj)).to.eql({baz:"Baz"});
    expect(ref.extractByRef("foo.bar.baz", obj)).to.eql("Baz");
    expect(ref.extractByRef("bar", obj)).to.be.undefined;
    expect(ref.extractByRef("baz", obj)).to.be.undefined;
  });

  it("updates object", () => {
    expect(ref.updateByRef("foo", {foo:{bar:{baz:"Baz"}}}, "new")).to.eql({foo: "new"});
    expect(ref.updateByRef("foo.bar", {foo:{bar:{baz:"Baz"}}}, "new")).to.eql({foo:{bar: "new"}});
    expect(ref.updateByRef("foo.bar.baz", {foo:{bar:{baz:"Baz"}}}, "new")).to.eql({foo:{bar:{baz: "new"}}});
    expect(() => ref.updateByRef("bar", {foo:{bar:{baz:"Baz"}}}, "new")).to.throw;
    expect(() => ref.updateByRef("baz", {foo:{bar:{baz:"Baz"}}}, "new")).to.throw;
  });

  it("updates in place", () => {
    let obj = {foo:{bar:{baz:"Baz"}}};
    let upd = ref.updateByRef("foo.bar", obj, "new");
    expect(upd).to.be.equal(obj);
  })
});
