import { expect } from '@open-wc/testing';

import { tmpl_slots, tmpl_paths, tmpl_deps, tmpl_interpolate } from "../src/templates";

describe("templates", () => {
    const tmpl = '<div class="${foo.prop1} ${foo.prop2}" attr="${baz}">Text ${bar.prop.prop1}, ${bar.prop.prop2}, ${baz}</div>';
    const plain = "plain text";


    it("parse slots", () => {
        expect(tmpl_slots(tmpl)).to.deep.equal(new Set([
            'foo.prop1',
            'foo.prop2',
            'bar.prop.prop1',
            'bar.prop.prop2',
            'baz'
        ]));
    });

    it("parse no slots", () => {
        expect(tmpl_slots(plain)).to.be.empty;
    });

    it("parse paths", () => {
        expect(tmpl_paths(tmpl)).to.deep.equal(new Set([
            ['foo', 'prop1'],
            ['foo', 'prop2'],
            ['bar', 'prop', 'prop1'],
            ['bar', 'prop', 'prop2'],
            ['baz']
        ]));
    });

    it("parse no paths", () => {
        expect(tmpl_paths(plain)).to.be.empty;
    });

    it("parse deps", () => {
        expect(tmpl_deps(tmpl)).to.deep.equal(new Set([
            'foo',
            'bar',
            'baz'
        ]));
    });

    it("parse no deps", () => {
        expect(tmpl_deps(plain)).to.be.empty;
    });

    it("render", () => {
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
        let result = tmpl_interpolate(tmpl, data);

        expect(result).to.equal('<div class="Foo_prop1 Foo_prop2" attr="Baz">Text Bar_prop_prop1, Bar_prop_prop2, Baz</div>');
    });

    it("render plain", () => {
        let result = tmpl_interpolate(plain, {});
        expect(result).to.equal(plain);
    });

    it("fails to render missing obj", () => {
        const tmpl = '<span>${baz}</span>';
        function render() {
            return tmpl_interpolate(tmpl, {foo: "Foo"});
        }
        expect(render).to.throw(Error);
    });

    it("fails to render missing prop", () => {
        const tmpl = '<span>${foo.bar.baz}</span>';
        function render() {
            return tmpl_interpolate(tmpl, {foo: {}});
        }
        expect(render).to.throw(Error);
    });

})
