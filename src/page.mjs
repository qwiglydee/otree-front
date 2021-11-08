import { oTreeEvent } from "./utils";

import { install_otText } from "./directives/ot-text";
import { install_otClass } from "./directives/ot-class";
import { install_otImg } from "./directives/ot-img";
import { install_otAttr } from "./directives/ot-attr";

import { install_otWhen } from "./directives/ot-when";
import { install_otDisplay } from "./directives/ot-display";
import { install_otInput } from "./directives/ot-input";

import { install_otStart } from "./directives/ot-start";


export class Page {
    constructor(body) {
        this.body = body;
        this.phase = {};

        install_otText(this.body);
        install_otClass(this.body);
        install_otImg(this.body);
        install_otAttr(this.body);
        install_otWhen(this.body);
        install_otDisplay(this.body);
        install_otInput(this.body, this);
        install_otStart(this.body, this);
    }

    fire(type, data={}) {
        // NB: queueing a task like a normal event, instead of dispatching synchronously
        setTimeout(() => this.body.dispatchEvent(oTreeEvent(type, {page: this, ...data})));
    }

    reset() {
        this.phase = {display: null, input: null};
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
        this.phase.display = phase;
        this.fire('display', {phase});
    }

    toggleInput(phase) {
        this.phase.input = phase;
        this.fire('input', {phase});
    }

    timeout() {
        this.toggleInput(false);
        this.fire('timeout');
    }

    // run() {
    //     this.fire('run');
    //     this.timing.forEach((phase, i) => {
    //         let delay = phase.time || 0;
    //         if ('display' in phase) {
    //             this._timers.delay(`phase-${i}-display`, () => this.toggleDisplay(phase.display), delay);
    //         }
    //         if ('input' in phase) {
    //             this._timers.delay(`phase-${i}-input`, () => this.toggleInput(phase.input),  delay);
    //         }
    //         if ('timeout' in phase) {
    //             this._timers.delay(`phase-${i}-timeout`, () => this.timeout(), delay + phase.timeout);
    //         }
    //     })
    // }

}
