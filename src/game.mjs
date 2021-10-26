import { Timers } from "./timers";
import { Deferred } from "./utils";

/** GenericGame
 * Generic stimulus/response sequence
 *
 * Config:
 * - trialPause: a pause before moving to next trial
 * - trialTimeout: time to auto skip trial after it displayed
 * - numIterations: total number of iterations
 * - gameTimeout: total timeout of all the game
 *
 * Display sequence: array of phases
 * - name: name og phase, triggers event `ot.display(phase)` and switches `data-ot-display` directives
 * - duration: number of ms before next phase
 * - input: bool, to enabled inputs and start measuring reaction time
 */

export class GenericGame {
    constructor(data, page, conf, phases) {
        this.data = data;
        this.page = page;
        this.conf = {
            trialTimeout: 0,
            trialPause: 1000,
            numIterations: null,
            gameTimeout: null
        };
        Object.assign(this.conf, conf);

        this.unfreeze_time = 0;
        this.sequence = [];
        if (phases) {
            let start = 0;
            phases.forEach((phase) => {
                this.sequence.push({start, name: phase.display, input: phase.input});
                start += phase.duration;
            });
            if (phases.slice(-1)[0].duration !== undefined) {
                this.sequence.push({start, name: null, input: false});
            }
        }

        this.progress = {};

        this._update_handler = (e) => this.onUpdate(e);
        this._running = null;
        this._game_timers = new Timers(); // timers: gameout, iter
        this._iter_timers = new Timers(); // for each display phase, 'ot.unfreeze', 'ot.timeout'
    }

    run() {
        this.page.root.addEventListener("ot.update", this._update_handler);
        this._running = new Deferred();
        if (this.conf.gameTimeout) {
            this._game_timers.delay('gameout', () => this.stop(new Error("timeout")), this.conf.gameTimeout);
        }
        if (this.conf.numIterations) this.updateProgress();

        this._game_timers.delay('iter', () => this.iter());

        return this._running.promise;
    }

    stop(reason) {
        this._game_timers.cancel();
        this._iter_timers.cancel();

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

        performance.mark("display");

        this.sequence.forEach((phase) => {
            this._iter_timers.delay(phase.name, () => this.displayPhase(phase.name), phase.start);
            if (phase.input) this._iter_timers.delay('ot.unfreeze', () => this.unfreezeInputs(), phase.start);
        })

        if (this.conf.trialTimeout) {
            this._iter_timers.delay('ot.timeout', () => this.onTimeout(), this.conf.trialTimeout);
        }
    }

    next() {
        if (this._running.state !== null) return; // stopped during some await
        if (this.conf.numIterations) this.updateProgress();
        this._iter_timers.cancel();
        this._game_timers.delay('iter', () => this.iter(), this.conf.trialPause);
    }

    updateProgress() {
        this.progress = {
            current: this.data.iteration,
            total: this.conf.numIterations
        };
        console.debug("progress:", this.progress);
        this.page.update({progress: this.progress});
    }

    unfreezeInputs() {
        this.page.unfreeze();
        performance.mark("unfreeze");
    }

    displayPhase(phase) {
        this.page.display(phase);
        performance.mark(`display-${phase}`);
    }

    onUpdate(event) {
        const { changes } = event.detail;
        if ('response' in changes) this.onResponse();
    }

    async onResponse() {
        this._iter_timers.cancel();

        this.page.freeze();

        performance.mark("response");
        performance.measure("reaction", "unfreeze", "response");
        let reaction_measure = performance.getEntriesByName("reaction")[0];

        console.debug("response:", this.page.state.response, reaction_measure.duration);

        let feedback = await this.data.response(this.page.state.response, reaction_measure.duration);
        console.debug("feedback:", feedback);
        this.page.update({feedback});
        this.next();
    }

    async onTimeout() {
        this._iter_timers.cancel();

        this.page.freeze();

        // await this.data.response(null, null);
        this.page.update({feedback: 'timeout'});
        this.next();
    }
}
