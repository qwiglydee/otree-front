import { LitElement } from 'lit';

import { otreeEventBubble } from './events';

export class otKey extends LitElement {
    static properties = {
        'keycode': {type: String},
        'response': {type: String},
    }

    connectedCallback() {
        window.addEventListener("keydown", (e) => this._onKey(e))
    }

    _onKey(event) {
        if (event.code === this.keycode) {
            event.preventDefault();
            this.dispatchEvent(otreeEventBubble("response", {response: this.response}));
        }
    }
}

customElements.define('otree-key', otKey);