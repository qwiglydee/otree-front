/**
 * Begins measurement
 *
 * @param {string} name
 */
export function begin(name) {
  const mark_beg = `otree.${name}.beg`;
  performance.clearMarks(mark_beg);
  performance.mark(mark_beg);
}

/**
 * Ends measurement
 *
 * @param {string} name
 * @returns {number} duration in mseconds
 */
export function end(name) {
  const mark_end = `otree.${name}.end`;
  performance.clearMarks(mark_end);
  performance.mark(mark_end);

  const mark_beg = `otree.${name}.beg`;
  const measure = `otree.${name}.measure`;
  performance.clearMeasures(measure);
  performance.measure(measure, mark_beg, mark_end);

  const entry = performance.getEntriesByName(measure)[0];
  return entry.duration;
}
