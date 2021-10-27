import { LocalData } from "../src/data";
import { loadImage, random_choice } from "../src/utils";

export class DemoData extends LocalData {
    async generate(iteration) {
        let a = Math.floor(Math.random() * 99  + 1), b = Math.floor(Math.random() * 99 + 1);
        let op = random_choice(['+', '-']);
        let solution;
        if (op == '+') solution = a + b;
        if (op == '-') solution = a - b;

        return {
            iteration: iteration,
            equation: `${a} ${op} ${b}`,
            solution,
        }
    }

    async validate(iteration, trial, response) {
        return trial.solution == Number(response);
    }
}
