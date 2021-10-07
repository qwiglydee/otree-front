import { LitElement } from 'lit';

export class otError extends LitElement {
    static properties = {
        errorcode: {type: String},
    };

    constructor() {
        super();
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        this.addEventListener("otree-reset", () => this.toggle(false));
        this.addEventListener("otree-updated", (ev) => this._onUpdate(ev.detail.update));
    }

    toggle(enabled) {
        this.style.display = enabled ? null : "none";
    }

    _onUpdate(update){
        if (!('error' in update)) return;
        this.toggle(update.error == this.errorcode);
    }
}

customElements.define('otree-error', otError);