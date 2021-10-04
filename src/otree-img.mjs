import { LitElement, html } from 'lit';

import { jspath } from "./jspath";

export class otImage extends LitElement {
    static properties = {
        'ref': {type: String},
        'img': {type: String, state: true},
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
        this.img = null;
    }

    load(event) {
        const data = { trial: event.detail.trial };
        this.img = jspath(this.ref, data);
    }

    render() {
        return this.img;
    }
}

customElements.define('otree-img', otImage);