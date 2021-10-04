import { LitElement, html } from 'lit';

export class otResponse extends LitElement {
    static properties = {
        'content': {type: String, state: true},
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-trial-reset", () => this.reset());
        this.addEventListener("otree-trial-responded", (event) => this.load(event));
    }

    reset() {
        this.content = null;
    }

    load(event) {
        this.content = event.detail.response;
    }

    render() {
        return this.content;
    }
}

customElements.define('otree-response', otResponse);