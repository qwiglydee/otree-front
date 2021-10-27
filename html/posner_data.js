import { LocalData } from "../src/data";
import { random_choice } from "../src/utils";

const SIDES = ['left', 'right'];

export class DemoData extends LocalData {
    async generate(iteration) {
        let cue_side = random_choice(SIDES);
        let target_side = random_choice(SIDES);

        return {
            iteration: iteration,
            cue: cue_side,
            target: target_side,
            congruent: cue_side == target_side
        }
    }

    async validate(iteration, trial, response) {
        return trial.target == response;
    }
}
