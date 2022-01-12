/** @module utils/random */

/**
 * Makes random choice from an array
 * 
 * @param {Array} choices
 */
export function choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}