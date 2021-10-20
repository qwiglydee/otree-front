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
        // TODO: attach directives
        otWhen.attach(this.root);
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

    update(change) {
        this.state = Object.assign(this.state, change);
        this.fire('update', {change});
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
