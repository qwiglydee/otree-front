import { LitElement } from 'lit';
import { delay } from './timers';

export function otreeEvent(type, detail) {
    return new CustomEvent(`otree-${type}`, {bubbles: false, detail: detail});
}

export class otPage extends LitElement {
    constructor() {
        super();
        this.state = {
            started: false,
            frozen: false
        };
        this.otreeElems = Array.from(this.querySelectorAll("*")).filter(e => e.tagName.startsWith('OTREE-'));
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    broadcastEvent(type, data={}) {
        let event = otreeEvent(type, data);
        this.dispatchEvent(event);
        this.otreeElems.forEach(elem => elem.dispatchEvent(event));
    }

    firstUpdated() { // what for ???
        delay(() => this.broadcastEvent("loaded"));
    }

    resetState(state = {started: false, frozen: false}) {
        this.state = Object.assign({}, state);
        this.broadcastEvent("reset");
        this.broadcastEvent("updated", {update: state, state: this.state});
    }

    setState(update) {
        this.state = Object.assign(this.state, update);
        this.broadcastEvent("updated", {update: update, state: this.state});
    }

    getState(field) {
        return this.state[field];
    }

    freeze() {
        this.setState({frozen: true});
    }

    unfreeze() {
        this.setState({frozen: false});
    }

    display() {
        this.broadcastEvent("display");
        ;
    }
}

customElements.define('otree-page', otPage);