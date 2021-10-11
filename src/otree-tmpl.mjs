import { LitElement, html } from 'lit';

import { tmpl_deps, tmpl_interpolate } from "../src/templates";

/**
 * element for templating
 * supports attributes and innerHTML interpolation
 */
class otTmpl extends LitElement {
    static properties = {
        'html': {type: String, state: true},
    }

    constructor() {
        super();
        this.html = null;
        this.inner_tmpl = this.innerHTML;
        this.inner_deps = tmpl_deps(this.inner_tmpl);
        this.attrs_tmpl = new Map(Array.from(this.attributes).filter(a => tmpl_deps(a.value).size != 0).map(a => [a.name, a.value]));
        this.attrs_deps = Array.from(this.attrs_tmpl.values()).map(v => tmpl_deps(v)).reduce((s, deps) => new Set([...s, ...deps]), new Set());
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-reset", (event) => this._reset(event.detail.state));
        this.addEventListener("otree-updated", (event) => this._update(event.detail.update,  event.detail.state));
    }

    _reset(state) {
        this._update_attrs(state);
        this._update_inner(state);
    }

    _update(update, state) {
        function check(deps) {
            return deps && Array.from(deps).filter((d) => d in update).length != 0;
        }
        if (check(this.attrs_deps)) this._update_attrs(state);
        if (check(this.inner_deps)) this._update_inner(state);
    }

    _update_inner(state) {
        this.html = tmpl_interpolate(this.inner_tmpl, state);
    }

    _update_attrs(state) {
        this.attrs_tmpl.forEach((tmpl, name) => this.setAttribute(name, tmpl_interpolate(tmpl, state)));
    }

    render() {
        return html([this.html], []);
    }
}

export class otDiv extends otTmpl {};
export class otSpan extends otTmpl {};

customElements.define('otree-div', otDiv);
customElements.define('otree-span', otSpan);
