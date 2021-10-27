import { LocalData } from "../src/data";
import { random_choice } from "../src/utils";

export class DemoData extends LocalData {
    init() {
        const {chars, n, length} = this.conf;
        this.sequence = [];
        for(let i=0; i<length; i++) {
            let char = random_choice(chars);
            let back = i-n;
            this.sequence.push({
                iteration: i + 1,
                char: char,
                match: (back >= 0 && this.sequence[back].char == char)
            });
        }
    }

    async generate(iteration) {
        return this.sequence[iteration];
    }

    async validate(iteration, trial, response) {
        return trial.matches == response;
    }
}
