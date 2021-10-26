import { Timers } from "./timers";
import { Deferred } from "./utils";

/** GenericGame
 * Generic stimulus/response sequence
 *
 * Config:
 * - inputDelay: time before enabling inputs (== shen stimulus is displayed)
 * - inputTimeout: timeout of waiting input
 * - defaultResponse: the response to give on input timeout
 * - trialPause: a pause before moving to next trial
 * - numIterations: total number of iterations
 * - gameTimeout: total timeout of all the game
 */

export class GenericGame {
    constructor(data, page, conf) {
        this.data = data;
        this.page = page;
        this.conf = {
            inputDelay: 0,
            inputTimeout: 0,
            defaultResponse: null,
            trialPause: 1000,
            numIterations: null,
            gameTimeout: null
        };
        Object.assign(this.conf, conf);

        this.progress = {};

        this._update_handler = (e) => this.onUpdate(e);
        this._running = null;
        // timers: timeout, iter, unfreeze, skip
        this._timers = new Timers();
    }

    run() {
        this.page.root.addEventListener("ot.update", this._update_handler);
        this._running = new Deferred();
        if (this.conf.gameTimeout) {
            this._timers.delay('timeout', () => this.stop(new Error("timeout")), this.conf.gameTimeout);
        }
        if (this.conf.numIterations) this.updateProgress();

        this._timers.delay('iter', () => this.iter());

        return this._running.promise;
    }

    stop(reason) {
        this._timers.cancel();
        this.page.root.removeEventListener("ot.update", this._update_handler);
        this.page.reset();
        this.page.freeze();

        if (reason instanceof Error) {
            this._running.reject(reason);
        } else {
            this._running.resolve(reason);
        }
        return this._running.promise;
    }

    async iter() {
        this.page.reset({progress: this.progress});
        this.page.freeze();

        if (this.conf.numIterations && this.data.iteration == this.conf.numIterations) {
            this.stop("gameover");
            return;
        }

        let trial = await this.data.trial();
        this.page.update({trial});
        console.debug("trial:", trial);

        performance.clearMarks();
        performance.clearMeasures();

        this.page.display();
        performance.mark("display");
        this._timers.delay('unfreeze', () => this.unfreeze(), this.conf.inputDelay);
    }

    next() {
        if (this._running.state !== null) return; // stopped during some await
        if (this.conf.numIterations) this.updateProgress();
        this._timers.delay('iter', () => this.iter(), this.conf.trialPause);
    }

    updateProgress() {
        this.progress = {
            current: this.data.iteration,
            total: this.conf.numIterations
        };
        console.debug("progress:", this.progress);
        this.page.update({progress: this.progress});
    }

    unfreeze() {
        if (this.conf.inputTimeout) {
            this._timers.delay('skip', () => this.onSkip(), this.conf.inputTimeout);
        }
        this.page.unfreeze();
        performance.mark("input");
    }

    onUpdate(event) {
        const { changes } = event.detail;
        if ('response' in changes) this.onResponse();
    }

    async onResponse() {
        this._timers.cancel('iter', 'unfreeze', 'skip');

        this.page.freeze();

        performance.mark("response");
        performance.measure("reaction", "input", "response");
        let reaction_measure = performance.getEntriesByName("reaction")[0];

        console.debug("response:", this.page.state.response, reaction_measure.duration);

        let feedback = await this.data.response(this.page.state.response, reaction_measure.duration);
        console.debug("feedback:", feedback);
        this.page.update({feedback});
        this.next();
    }

    async onSkip() {
        this._timers.cancel('iter', 'unfreeze', 'skip');

        this.page.freeze();

        await this.data.response(this.conf.defaultResponse, null);
        this.page.update({feedback: 'timeout'});
        this.next();
    }
}
