import { sleep, delay, cancel} from "./timers";

/** GenericGame
 * Generic stimulus/response sequence
 *
 * Config:
 * - inputDelay: time before enabling inputs (== shen stimulus is displayed)
 * - inputTimeout: timeout of waiting input
 * - defaultResponse: the response to give on input timeout
 * - trialPause: a pause before moving to next trial
 * - numIterations: total number of iterations
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
            numIterations: null
        };
        Object.assign(this.conf, conf);
        // attach event handlers
        this.page.addEventListener("ot.update", (e) => this.onUpdate(e));
    }

    start() {
        if (this.conf.numIterations) this.updateProgress();
        this.iter();
    }

    async iter() {
        this.page.reset();
        this.page.freeze();

        let trial = await this.data.trial();
        this.page.update({trial});

        performance.clearMarks();
        performance.clearMeasures();

        this.page.display();
        performance.mark("display");

        if (this.conf.inputDelay) {
            delay(() => this.enableInput(), this.conf.inputDelay);
        } else {
            this.enableInputs();
        }
        if (this.conf.inputTimeout) {
            this._timeout = delay(() => this.onTimeout(), this.conf.inputDelay + this.conf.inputTimeout);
        }
    }

    updateProgress() {
        this.page.update({progress: {
            current: this.data.iteration,
            total: this.conf.numIterations
        }});
    }

    enableInput() {
        this.page.unfreeze();
        performance.mark("input");
    }

    onUpdate(event) {
        const { changes } = event.detail;
        if ('response' in changes) this.onResponse();
    }

    async onResponse() {
        this._timeout = cancel(this._timeout);
        this.page.freeze();

        performance.mark("response");
        performance.measure("reaction", "input", "response");
        let reaction_measure = performance.getEntriesByName("reaction")[0];

        let feedback = await this.data.response(this.page.state.response, reaction_measure.duration);
        this.page.update({feedback});

        if (this.conf.numIterations) this.updateProgress();
        delay(() => this.iter(), this.conf.trialPause);
    }

    async onTimeout() {
        this._timeout = undefined;
        this.page.freeze();

        await this.data.response(this.conf.defaultResponse, null);
        this.page.update({feedback: 'timeout'});

        if (this.conf.numIterations) this.updateProgress();
        delay(() => this.iter(), this.conf.trialPause);
    }
}
