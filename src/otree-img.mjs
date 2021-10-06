import { LitElement, html } from 'lit';

import { jspath } from "./jspath";

export class otImage extends LitElement {
    static properties = {
        'obj': {type: String},
        'field': {type: String},
        'img': {type: String, state: true},
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-reset", () => this.reset());
        this.addEventListener("otree-updated", (event) => this._onUpdate(event.detail.state));
    }

    reset() {
        this.img = null;
    }

    _onUpdate(state) {
        if (this.obj in state) {
            this.img = jspath(this.field, state[this.obj]);
        }
    }

    render() {
        return this.img;
    }
}

customElements.define('otree-img', otImage);