/** Local data source
 * Generates all the trials locally in memory.
 * Using `generate()` to generate new trials.
 * Using `validate()` to validate responses.
 */
export class LocalData {
    constructor(conf) {
        this.conf = conf;
        this.iteration = 0;
        this._trial = null;
        this._response = null;
        this._feedback = null;
    }

    async init() {
    }

    async trial() {
        this.iteration += 1;
        this._trial = await this.generate(this.iteration);
        console.debug("trial:", this._trial);
        return this._trial;
    }

    async response(value, reaction_time) {
        this._response = value;
        console.debug("response:", this._response, reaction_time);
        this._feedback = await this.validate(this.iteration, this._trial, this._response);
        console.debug("feedback:", this._feedback);
        return this._feedback;
    }

    async generate(iteration) {
        throw new Error("Method `LocalData.generate` should be implemented");
    }

    async validate(iteration, trial, response) {
        throw new Error("Method `LocalData.generate` should be implemented");
    }
}