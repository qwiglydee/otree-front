import { LitElement } from 'lit';

export class otStart extends LitElement {
    static properties = {
        keycode: {type: String},
    };

    constructor() {
        super();
        this.keycode = 'Space';
        this.enabled = null;
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        this.page = this.closest('otree-page');
        window.addEventListener("keydown", (ev) => this._onKey(ev));
        this.addEventListener("otree-updated", (ev) => this._onUpdate(ev.detail.update));
    }

    toggle(enabled) {
        this.enabled = enabled;
        this.style.display = enabled ? null : "none";
    }

    _onKey(event) {
        if (!this.enabled || event.code != this.keycode) return;
        event.preventDefault();
        this.page.setState({started: true});
    }

    _onUpdate(update) {
        if (!('started' in update)) return;
        this.toggle(!update.started);
    }
}

customElements.define('otree-start', otStart);