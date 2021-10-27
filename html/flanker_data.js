import { LocalData } from "../src/data";
import { random_choice } from "../src/utils";

const SIDES = ['left', 'right'];

export class DemoData extends LocalData {
    async generate(iteration) {
        let context_side = random_choice(SIDES);
        let target_side = random_choice(SIDES);

        let target = random_choice(this.conf.chars[target_side]);
        let context = random_choice(this.conf.chars[context_side]);

        return {
            iteration,
            target,
            context,
            target_side,
            context_side,
            congruent: context_side == target_side,
        }
    }

    async validate(iteration, trial, response) {
        return trial.target_side == response;
    }
}
