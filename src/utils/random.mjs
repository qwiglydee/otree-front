export function random_choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}