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

    _show() {
        this.style.display = null;
    }

    _hide() {
        this.style.display = "none";
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("otree-reset", () => this.reset());
        this.addEventListener("otree-updated", (event) => this._onUpdate(event.detail.update));
    }

    reset() {
        this.value = null;
        this._hide();
    }

    _onUpdate(update) {
        if ('feedback' in update) {
            this.value = update.feedback;
            this._show();
        }
    }

    render() {
        if (this.value === null) return "";
        return this.value
            ? html`<span class="valid">✓</span>`
            : html`<span class="invalid">❌</span>`;
    }
}

customElements.define('otree-feedback', otFeedback);