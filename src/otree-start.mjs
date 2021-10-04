import { LitElement } from 'lit';
import { otreeEventBubble } from './events';

export class otStart extends LitElement {
    static properties = {
        keycode: {type: String},
    };

    constructor() {
        super();
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    render() {}

    connectedCallback() {
        this.addEventListener("otree-loaded", () => this._show());
        this.addEventListener("otree-started", () => this._hide());
        window.addEventListener("keydown", (ev) => this._onKey(ev));
    }

    _show() {
        this.style.display = null;
    }

    _hide() {
        this.style.display = "none";
    }

    _onKey(event) {
        if (this.style.display == "none") return;
        if (event.code == this.keycode) {
            event.preventDefault();
            this.dispatchEvent(otreeEventBubble("start"));
        }
    }
}

customElements.define('otree-start', otStart);