import { delay, cancel, sleep } from "../src/timers";

/**
 * GenericGame
 *
 * implements generic logic:
 * - get trial, show trial
 * - wait for response
 * - get feedback, show feedback
 * - wait for trialDelay
 * - goto next iteration
 *
 * TODO: trial timeout and default response
 * TODO: retries
 * TODO: max iterations
 * TODO: page timeout
 */

 export class GenericGame {
    constructor(data, page, params) {
        this.data = data;
        this.page = page;
        this.params = params;
        this.progress = {
            total: this.params.num_iterations,
            iteration: 0
        }

        this.trialtimeout = null;

        // NB: custom events are synchronous
        this.page.addEventListener("otree-updated", (e) => {
            delay(() => this.onUpdate(e.detail.update, e.detail.state));
        });
    }

    init() {
    }

    onUpdate(update, state) {
        if ('started' in update && update.started) {
            this.start();
        } else if ('response' in update) {
            this.handleResponse(update.response);
        }
    }

    start() {
        this.page.setState({progress: this.progress});
        this.iterTrial();
    }

    async iterTrial() {
        this.page.reset();
        this.page.freeze();
        this.page.setState({progress: this.progress});

        let trial = await this.data.getTrial();
        this.page.setState({trial});

        performance.clearMarks();
        performance.clearMeasures();

        this.page.display();
        performance.mark("display");

        delay(() => this.enableInputs(), this.params.inputDelay);
        this.trialtimeout = delay(() => this.trialTimeout(), this.params.inputDelay + this.params.trialTimeout);
    }

    enableInputs() {
        this.page.unfreeze();
        performance.mark("input");
    }

    async trialTimeout() {
        this.page.freeze();
        await this.data.handleResponse(this.page.getState('trial'), null);
        this.page.setState({feedback: 'timeout'});

        this.progress.iteration += 1;
        this.page.setState({progress: this.progress});

        await sleep(this.params.trialDelay);
        delay(() => this.iterTrial());
    }

    async handleResponse(response) {
        this.trialtimeout = cancel(this.trialtimeout);
        this.page.freeze();
        performance.mark("response");
        performance.measure("reaction", "input", "response");
        let reaction_measure = performance.getEntriesByName("reaction")[0];
        let feedback = await this.data.handleResponse(this.page.getState('trial'), response, reaction_measure.duration);
        this.page.setState({feedback});

        this.progress.iteration += 1;
        this.page.setState({progress: this.progress});

        await sleep(this.params.trialDelay);
        delay(() => this.iterTrial());
    }
}
