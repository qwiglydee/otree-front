import { LitElement, html } from 'lit';

import { jspath } from "./jspath";

export class otText extends LitElement {
    static properties = {
        'ref': {type: String},
        'content': {type: String, state: true},
    }

    constructor() {
        super();
        this.ref = "";
        this.content = "xxx";
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-trial-reset", () => this.reset());
        this.addEventListener("otree-trial-loaded", (event) => this.load(event));
    }

    reset() {
        this.content = null;
    }

    load(event) {
        const data = { trial: event.detail.trial };
        this.content = jspath(this.ref, data);
    }

    render() {
        return this.content;
    }
}

customElements.define('otree-text', otText);