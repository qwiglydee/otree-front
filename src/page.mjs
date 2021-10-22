import { install_otWhen } from "./ot-when";
import { install_otText } from "./ot-text";
import { install_otClass } from "./ot-class";
import { install_otAttr } from "./ot-attr";
import { install_otImg } from "./ot-img";
import { install_otDisplay } from "./ot-display";
import { install_otInput } from "./ot-input";
import { install_otStart } from "./ot-start";

export class Page {
    constructor(root, conf) {
        this.root = root;
        if (root === undefined) {
            this.root = document.querySelector('body');
        }
        this.conf = Object.assign({}, conf);
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
    }

    fire(type, data={}) {
        const detail = Object.assign({page: this}, data);
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
        // TODO: check frozen state
        this.state = Object.assign(this.state, changes);
        this.fire('update', {changes});
    }

    display() {
        this.fire('display');
    }

    freeze() {
        this.fire('freeze', {frozen: true});
    }

    unfreeze() {
        this.fire('freeze', {frozen: false});
    }
}
