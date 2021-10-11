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
            error: null
        };
        this.frozen = true;
        this.otreeElems = Array.from(this.querySelectorAll("*")).filter(e => e.tagName.startsWith('OTREE-') && e.tagName != "OTREE-KEY");
        this.keymap = new Map(Array.from(this.querySelectorAll("otree-key")).map((elem) => [elem.getAttribute('keycode'), elem.getAttribute('response')]));
        if (this.keymap.size == 0) this.keymap = null;
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("keydown", (e) => this._onKey(e));
    }

    broadcastEvent(type, data={}) {
        let event = otreeEvent(type, data);
        this.dispatchEvent(event);
        this.otreeElems.forEach(elem => elem.dispatchEvent(event));
    }

    firstUpdated() { // what for ???
        delay(() => this.broadcastEvent("loaded"));
    }

    reset() {
        this.state = Object.assign({started: true, error: null});
        this.frozen = true;
        this.broadcastEvent("reset", {state: this.state});
    }

    setState(update) {
        if ('response' in update && this.frozen) {
            this.setState({error: 'frozen'});
            return;
        }

        this.state = Object.assign(this.state, update);
        this.broadcastEvent("updated", {update: update, state: this.state});
    }

    getState(field) {
        return this.state[field];
    }

    freeze() {
        this.frozen = true;
        this.dispatchEvent(otreeEvent("freeze", {frozen: this.frozen}));
    }

    unfreeze() {
        this.frozen = false;
        this.dispatchEvent(otreeEvent("freeze", {frozen: this.frozen}));
        this.setState({error: null});
    }

    display() {
        this.broadcastEvent("display");
    }

    _onKey(event) {
        if (this.keymap == null) return;
        event.preventDefault();

        if (!this.keymap.has(event.code)) {
            this.setState({error: 'wrongkey'});
            return;
        }

        this.setState({response: this.keymap.get(event.code), error: null});
    }
}

customElements.define('otree-page', otPage);