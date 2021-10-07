import { delay, sleep } from "../src/timers";

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
        this.page.resetState();
        this.iterTrial();
    }

    async iterTrial() {
        let trial = await this.data.getTrial();
        this.page.setState({trial});
        this.page.display();
        delay(() => this.page.unfreeze(), this.params.inputDelay);
    }

    async handleResponse(response) {
        this.page.freeze();
        let feedback = await this.data.handleResponse(this.page.getState('trial'), response);
        this.page.setState({feedback});
        await sleep(this.params.trialDelay);
        this.page.resetState();
        this.iterTrial();
    }
}
