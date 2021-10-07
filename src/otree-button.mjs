import { LitElement } from 'lit';

export class otButton extends LitElement {
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
        this.addEventListener('click', () => this._onClick());
    }

    _onClick() {
        this.page.setState({response: this.response});
    }

}

customElements.define('otree-button', otButton);