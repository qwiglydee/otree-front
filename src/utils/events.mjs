/** Utils for event handling
 * @module events
 */

/** adds event handler to the page
 *
 * @param conf {Object} event-independent config, at least `page` required
 * @param type {String} event type
 * @param handler {function(page, target, conf, event)} handler
 * @returns {Object} handler wrapper {conf, type, listener}
 */
export function onPage(conf, type, handler) {
  if (!('page' in conf)) throw new Error("Handler conf missed `page`");
  const listener = (event) => handler(conf, event);
  conf.page.body.addEventListener(type, listener);
  return {conf, type, listener};
}

/** removes event listener from page
 *
 * @param wrapper a wrapper returned by `onPage`
 */
export function offPage(wrapper) {
  wrapper.conf.page.body.removeEventListener(wrapper.type, wrapper.listener);
}

/** adds event handler to an element
 *
 * @param conf {Object} event-independent config, at least `target` required
 * @param type {String} event type
 * @param handler {function(page, target, conf, event)} handler
 * @returns {Object} handler wrapper {conf, type, listener}
 */
export function onTarget(conf, type, handler) {
  if (!('page' in conf)) throw new Error("Handler conf missed `target`");
  const listener = (event) => handler(conf, event)
  conf.target.addEventListener(type, listener);
  return {conf, type, listener};
}

/** removes event listener from an element
 * @param wrapper a wrapper returned by `onPage`
 */
export function offTarget(wrapper) {
  wrapper.conf.target.removeEventListener(wrapper.type, wrapper.listener);
}

/** triggers an event on the page
 *
 * @param page {Page} the page
 * @param type {String} event type to construct
 * @param detail {Object} some data to pass in event.detail
 */
export function firePage(page, type, detail) {
  const event = new CustomEvent(type, {detail});
  // NB: queueing a task like a normal event, instead of dispatching synchronously
  setTimeout(() => page.body.dispatchEvent(event));
}

/** triggers an event on an elem
 *
 * @param target {HTMLElement} the element
 * @param type {String} event type to construct
 * @param detail {Object} some data to pass in event.detail (for constructed event)
 */
export function fireTarget(target, type, detail) {
  const event = new CustomEvent(type, {detail});
  // NB: queueing a task like a normal event, instead of dispatching synchronously
  setTimeout(() => target.dispatchEvent(event));
}