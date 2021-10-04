import { LitElement, html, css } from 'lit';

export class otFeedback extends LitElement {
    static properties = {
        'value': {type: String, state: true},
    }

    static styles = css`
        .valid { color: #198754; }
        .invalid { color: #dc3545; }
        `;

    constructor() {
        super();
        this.value = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-trial-reset", () => this.reset());
        this.addEventListener("otree-trial-feedback", (event) => this.load(event));
    }

    reset() {
        this.value = null;
    }

    load(event) {
        this.value = event.detail.feedback;
    }

    render() {
        if (this.value === null) return "";
        return this.value
            ? html`<span class="valid">✓</span>`
            : html`<span class="invalid">❌</span>`;
    }
}

customElements.define('otree-feedback', otFeedback);