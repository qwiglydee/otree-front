import { LitElement } from 'lit';
import { otreeEvent } from './events';
import { sleep } from './timers';

export class otPage extends LitElement {
    static properties = {
        trialTimeout: {type: Number},
        defaultResponse: {type: String},
        afterTrial: {type: Number}
      };

    constructor() {
        super();
        this.otreeElems = Array.from(this.querySelectorAll("*")).filter(e => e.tagName.startsWith('OTREE-'));

        this.started = false;

        this.trial = {};
        this.response = null;
        this.feedback = null;
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    connectedCallback() {
        this.addEventListener("otree-start", () => this.startGame());
        this.addEventListener("otree-response", (e) => this.onResponse(e));
    }

    broadcastEvent(event) {
        this.dispatchEvent(event);
        this.otreeElems.forEach(elem => elem.dispatchEvent(event));
    }

    firstUpdated() {
        delay(() => this.broadcastEvent(otreeEvent("loaded")));
    }

    startGame() {
        this.broadcastEvent(otreeEvent("started"));
        this.nextTrial();
    }

    async nextTrial() {
        this.resetTrial();
        await this.newTrial();
    }

    resetTrial() {
        this.trial = null;
        this.broadcastEvent(otreeEvent("trial-reset"));
    }

    async newTrial() {
        this.trial = await window.generateTrial();
        this.broadcastEvent(otreeEvent("trial-loaded", {trial: this.trial}));
        this.broadcastEvent(otreeEvent("trial-start"));
    }

    async onResponse(event) {
        this.response = event.detail.response;
        this.broadcastEvent(otreeEvent("trial-responded", {trial: this.trial, response: this.response}));
        this.feedback = await window.validateResponse(this.trial, this.response);
        this.broadcastEvent(otreeEvent("trial-feedback", {trial: this.trial, response: this.response, feedback: this.feedback}));
        await sleep(this.afterTrial);
        this.nextTrial();
    }
}

customElements.define('otree-page', otPage);