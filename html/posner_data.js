import { LocalData } from "../src/data";
import { random_choice } from "../src/utils";

const SIDES = ['left', 'right'];

export class DemoData extends LocalData {
    async generate(iteration) {
        let cue_side = random_choice(SIDES);
        let target_side = random_choice(SIDES);

        return {
            iteration: iteration,
            prime: prime,
            prime_cls: prime_mood,
            stimulus_img: stimulus_img,
            solution: stimulus_mood,
            congruent: stimulus_mood == prime_mood
        }
    }

    async validate(iteration, trial, response) {
        return trial.solution == response;
    }
}
