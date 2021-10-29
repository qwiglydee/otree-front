import { Timers } from "./timers";

import { install_otText } from "./directives/ot-text";
import { install_otClass } from "./directives/ot-class";
import { install_otImg } from "./directives/ot-img";
import { install_otAttr } from "./directives/ot-attr";

import { install_otWhen } from "./directives/ot-when";
import { install_otDisplay } from "./directives/ot-display";
import { install_otInput } from "./directives/ot-input";

import { install_otStart } from "./directives/ot-start";


export class Page {
    constructor(root, timing=[]) {
        this.root = root;
        this.timing = timing;
        this._timers = new Timers();
        this._phase = {display: null, input: null};

        install_otText(this.root);
        install_otClass(this.root);
        install_otImg(this.root);
        install_otAttr(this.root);
        install_otWhen(this.root);
        install_otDisplay(this.root);
        install_otInput(this.root, this);
        install_otStart(this.root, this);
    }

    fire(type, data={}) {
        const event = new CustomEvent(`ot.${type}`, {detail: {page: this, ...data}});
        // NB: queueing a task like a normal event, instead of dispatching synchronously
        setTimeout(() => this.root.dispatchEvent(event));
    }

    reset() {
        this._timers.cancel();
        this.fire('reset');
    }

    update(changes) {
        this.fire('update', {changes});
    }

    response(changes) {
        this.fire('response', changes);
        this.fire('update', {changes});
    }

    error(code) {
        this.fire('error', {error: code});
        this.fire('update', {changes: {error: code}});
    }

    toggleDisplay(phase) {
        this._phase.display = phase;
        this.fire('display', {phase});
    }

    toggleInput(phase) {
        this._phase.input = phase;
        this.fire('input', {phase});
    }

    timeout() {
        this._timers.cancel();
        this.toggleInput(false);
        this.fire('timeout');
    }

    run() {
        this.fire('run');
        this.timing.forEach((phase, i) => {
            let delay = phase.time || 0;
            if ('display' in phase) {
                this._timers.delay(`phase-${i}-display`, () => this.toggleDisplay(phase.display), delay);
            }
            if ('input' in phase) {
                this._timers.delay(`phase-${i}-input`, () => this.toggleInput(phase.input),  delay);
            }
            if ('timeout' in phase) {
                this._timers.delay(`phase-${i}-timeout`, () => this.timeout(), delay + phase.timeout);
            }
        })
    }

}
