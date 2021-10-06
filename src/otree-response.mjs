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
        this.addEventListener("otree-reset", () => this.reset());
        this.addEventListener("otree-updated", (event) => this._onUpdate(event.detail.update));
    }

    _show() {
        this.style.display = null;
    }

    _hide() {
        this.style.display = "none";
    }


    reset() {
        this.content = null;
        this._hide();
    }

    _onUpdate(update) {
        if ('response' in update) {
            this.content = update.response;
            this._show();
        }
    }

    render() {
        return this.content;
    }
}

customElements.define('otree-response', otResponse);