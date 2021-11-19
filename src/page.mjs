import { Changes } from "./utils/changes";
import { firePage } from "./utils/events";

import { otText } from "./directives/ot-text";
import { otClass } from "./directives/ot-class";
import { otImg } from "./directives/ot-img";
import { otAttr } from "./directives/ot-attr";

import { otWhen } from "./directives/ot-when";
import { otDisplay } from "./directives/ot-display";
import { otInput } from "./directives/ot-input";

import { otStart } from "./directives/ot-start";


export class Page {
    constructor(body) {
        this.body = body || document.body;
        this.phase = {};
        this.init();
    }

    init() {
        otText(this);
        otClass(this);
        otImg(this);
        otAttr(this);
        otWhen(this);
        otDisplay(this);
        otInput(this);
        otStart(this);
    }

    fire(type, detail) {
        firePage(this, type, detail);
    }

    reset() {
        this.phase = {};
        this.fire('otree.reset');
    }

    start() {
        this.fire('otree.start');
    }

    status(data) {
        this.fire('otree.status', data);
        // convert status object `{ foo: val }` to changes of form `{ 'status.foo': val }`
        this.fire('otree.update', new Map([...Object.entries(data)].map(([k,v]) => ["status."+k, v])));
    }

    update(changes) {
        if (!(changes instanceof Changes)) changes = new Changes(changes);
        this.fire('otree.update', changes);
    }

    response(changes) {
        if (!(changes instanceof Changes)) changes = new Changes(changes);
        this.fire('otree.response', changes);
    }

    error(code, message) {
        if (code == null) {
            this.fire('otree.error');
            this.fire('otree.update', {error: undefined});
        } else {
            let error = {code, message};
            if (!message) delete error.message;
            this.fire('otree.error', error);
            this.fire('otree.update', {error});
        }
    }

    toggle(phase) {
        this.phase = phase;
        this.fire('otree.phase', phase);
    }

    timeout() {
        this.fire('otree.timeout');
    }
}
