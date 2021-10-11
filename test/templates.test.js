import { expect } from '@open-wc/testing';

import { tmpl_slots, tmpl_deps, tmpl_path_extract, tmpl_interpolate } from "../src/templates";

describe("templates", () => {
    const tmpl = '<div class="${foo.prop1} ${foo.prop2}" attr="${baz}">Text ${bar.prop.prop1}, ${bar.prop.prop2}, ${baz}</div>';
    const plain = "plain text";
    const data = {
        'foo': {
            'prop1': "Foo_prop1",
            'prop2': "Foo_prop2"
        },
        'bar': {
            'prop': {
                'prop1': "Bar_prop_prop1",
                'prop2': "Bar_prop_prop2"
            }
        },
        'baz': "Baz",
    }

    it("can parse slots", () => {
        expect(tmpl_slots(tmpl)).to.deep.equal(new Set([
            'foo.prop1',
            'foo.prop2',
            'bar.prop.prop1',
            'bar.prop.prop2',
            'baz'
        ]));
    });

    it("can parse no slots", () => {
        expect(tmpl_slots(plain)).to.be.empty;
    });

    it("can parse deps", () => {
        expect(tmpl_deps(tmpl)).to.deep.equal(new Set([
            'foo',
            'bar',
            'baz'
        ]));
    });

    it("can parse no deps", () => {
        expect(tmpl_deps(plain)).to.be.empty;
    });

    it("can extract objs", () => {
        expect(tmpl_path_extract("foo", data)).to.deep.equal({'prop1': "Foo_prop1", 'prop2': "Foo_prop2"});
    });

    it("can extract broken paths", () => {
        expect(tmpl_path_extract("foo.broken", data)).to.be.undefined;
    });

    it("can interpolate", () => {
        expect(tmpl_interpolate(tmpl, data)).to.equal('<div class="Foo_prop1 Foo_prop2" attr="Baz">Text Bar_prop_prop1, Bar_prop_prop2, Baz</div>');
    });

    it("can interpolate plain", () => {
        expect(tmpl_interpolate(plain, {})).to.equal(plain);
    });

    it("fail to interpolate broken field", () => {
        expect(() => tmpl_interpolate('<span>${baz}</span>', {})).to.throw(Error);
    });

    it("fail to interpolate broken path", () => {
        expect(() => tmpl_interpolate('<span>${foo.bar.baz}</span>', {foo: {}})).to.throw(Error);
    });
})
