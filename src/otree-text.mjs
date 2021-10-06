import { LitElement, html } from 'lit';

import { jspath } from "./jspath";

export class otText extends LitElement {
    static properties = {
        'obj': {type: String},
        'field': {type: String},
        'content': {type: String, state: true},
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
        this.content = null;
    }

    _onUpdate(state) {
        if (this.obj in state) {
            this.content = jspath(this.field, state[this.obj]);
        }
    }

    render() {
        return this.content;
    }
}

customElements.define('otree-text', otText);