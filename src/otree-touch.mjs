import { LitElement } from 'lit';

export class otTouch extends LitElement {
    static properties = {
        response: {type: String},
    };

    constructor() {
        super();
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        this.page = this.closest('otree-page');
        this.addEventListener('touchstart', (ev) => this._onTouch(ev));
    }

    _onTouch(event) {
        event.preventDefault();
        this.page.setState({response: this.response});
    }

}

customElements.define('otree-touch', otTouch);