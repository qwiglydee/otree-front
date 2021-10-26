import { install_otWhen } from "./directives/ot-when";
import { install_otText } from "./directives/ot-text";
import { install_otClass } from "./directives/ot-class";
import { install_otAttr } from "./directives/ot-attr";
import { install_otImg } from "./directives/ot-img";
import { install_otDisplay } from "./directives/ot-display";
import { install_otInput } from "./directives/ot-input";
import { install_otStart } from "./directives/ot-start";

export class Page {
    constructor(root, conf) {
        this.root = root;
        if (root === undefined) {
            this.root = document.querySelector('body');
        }
        this.conf = Object.assign({}, conf);
        this.frozen = false;
        this.state = {};
    }

    init() {
        install_otWhen(this.root);
        install_otText(this.root);
        install_otClass(this.root);
        install_otAttr(this.root);
        install_otImg(this.root);
        install_otDisplay(this.root);
        install_otInput(this.root, this);
        install_otStart(this.root, this);

        let default_input = (event) => {
            if (this.frozen) {
                this.error('frozen_input'); event.preventDefault();
            }
            // TODO: ??? invalid key error
        };
        this.root.addEventListener('click', default_input);
        this.root.addEventListener('touchend', default_input);
        this.root.addEventListener('keydown', default_input);
    }

    fire(type, data={}) {
        const detail = Object.assign({page: this}, data);
        // NB: queueing a task like a normal event, instead of dispatching synchronously
        setTimeout(() => this.root.dispatchEvent(new CustomEvent(`ot.${type}`, {detail})));
    }

    start() {
        this.fire('start');
    }

    reset(state = {}) {
        this.state = Object.assign({}, state);
        this.fire('reset');
    }

    update(changes) {
        this.state = Object.assign(this.state, changes);
        this.fire('update', {changes});
    }

    response(changes) {
        const delta = Object.assign({}, changes, {error: undefined});
        this.state = Object.assign(this.state, delta);
        this.fire('update', {changes: delta});
    }

    display() {
        this.fire('display');
    }

    freeze() {
        this.frozen = true;
        this.fire('freeze', {frozen: true});
    }

    unfreeze() {
        this.frozen = false;
        this.fire('freeze', {frozen: false});
    }

    error(code) {
        this.state['error'] = code;
        this.fire('error', {error: code});
        this.fire('update', {changes: {error: code}});
    }
}
