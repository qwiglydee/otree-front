import { install_otWhen } from "./ot-when";

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
