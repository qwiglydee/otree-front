const WORDS = {
    positive: ["amusement", "fun", "friendship", "happyness", "joy"],
    negative: ["anger", "hate", "fear", "panic", "sickness"]
}

const EMOJIS = {
    positive: ["emoji_u263a.png", "emoji_u1f600.png", "emoji_u1f601.png", "emoji_u1f60a.png", "emoji_u1f60d.png"],
    negative: ["emoji_u2639.png", "emoji_u1f612.png", "emoji_u1f616.png", "emoji_u1f623.png", "emoji_u1f62c.png"]
}

const MOODS = ['positive', 'negative'];

function loadImage(url) {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function generateTrial() {
    function choice(choices) {
        return choices[Math.floor(Math.random() * choices.length)];
    }

    prime_mood = choice(MOODS);
    prime = choice(WORDS[prime_mood]);
    stimulus_mood = choice(MOODS);
    stimulus = choice(EMOJIS[stimulus_mood]);
    stimulus_img = await loadImage(`/assets/images/${stimulus}`);

    return {
        prime: prime,
        stimulus: stimulus_img,
        solution: stimulus_mood,
        congruent: stimulus_mood == prime_mood
    }
}

async function validateResponse(trial, response) {
    return trial.solution === response;
}