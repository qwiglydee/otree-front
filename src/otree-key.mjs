import { LitElement } from 'lit';

export class otKey extends LitElement {
    static properties = {
        'keycode': {type: String},
        'response': {type: String},
    }

    connectedCallback() {
        this.page = this.closest('otree-page');
        window.addEventListener("keydown", (e) => this._onKey(e))
    }

    _onKey(event) {
        if (event.code === this.keycode) {
            event.preventDefault();
            this.page.setState({response: this.response});
        }
    }
}

customElements.define('otree-key', otKey);