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
    }

    fire(type, detail={}) {
        setTimeout(() => this.root.dispatchEvent(new CustomEvent(`ot.${type}`, {detail})));
    }

    start(state) {
        this.fire('start');
        if (state !== undefined) {
            this.reset(state);
        }
    }

    reset(state) {
        this.state = Object.assign({}, state);
        this.fire('reset', {state: this.state});
    }

    update(change) {
        this.state = Object.assign(this.state, change);
        this.fire('update', {change, state: this.state});
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
