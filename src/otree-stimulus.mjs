import { LitElement } from 'lit';
import { sleep } from './timers';

export class otStimulus extends LitElement {
    // TODO: use cancellable timers, cancel them on reset or feedback

    static properties = {
        delay: {type: Number},
        exposure: {type: Number}
      };

    constructor() {
        super();
        this.delay=0;
        this.exposure=0;
    }

    createRenderRoot() {
        // disable shadow dom
        return this;
    }

    _show() {
        this.style.display = null;
    }

    _hide() {
        this.style.display = "none";
    }

    firstUpdated() {
        this._hide();
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('otree-trial-reset', () => this.reset());
        this.addEventListener('otree-trial-start', () => this.display());
    }

    reset() {
        this._hide();
    }

    async display() {
        await sleep(this.delay);
        this._show();
        if (this.exposure) {
            await sleep(this.exposure);
            this._hide();
        }
    }
}

customElements.define('otree-stimulus', otStimulus);