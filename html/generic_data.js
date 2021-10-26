import { LocalData } from "../src/data";
import { loadImage, random_choice } from "../src/utils";

const WORDS = {
    positive: ["amusement", "fun", "friendship", "happyness", "joy"],
    negative: ["anger", "hate", "fear", "panic", "sickness"]
}

const EMOJIS = {
    positive: ["emoji_u263a.png", "emoji_u1f600.png", "emoji_u1f601.png", "emoji_u1f60a.png", "emoji_u1f60d.png"],
    negative: ["emoji_u2639.png", "emoji_u1f612.png", "emoji_u1f616.png", "emoji_u1f623.png", "emoji_u1f62c.png"]
}

const MOODS = ['positive', 'negative'];


export class DemoData extends LocalData {
    async generate(iteration) {
        let prime_mood = random_choice(MOODS);
        let prime = random_choice(WORDS[prime_mood]);
        let stimulus_mood = random_choice(MOODS);
        let stimulus = random_choice(EMOJIS[stimulus_mood]);
        let stimulus_img = await loadImage(`/assets/images/${stimulus}`);

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
