/** Utils for event handling
 * @module events
 */

/** adds event handler to the page
 *
 * @param page {Page} the page
 * @param target {HTMLElement} an element the event designated for
 * @param params {Object} some config params to pass to the handler
 * @param type {String} event type
 * @param handler {function(page, target, params, event)} handler
 * @returns {Object} handler wrapper
 */
export function onPage(page, target, params, type, handler) {
  const listener = (event) => handler(page, target, params, event)
  page.body.addEventListener(type, listener);
  return {page, target, type, listener};
}

/** removes event listener from page
 *
 * @param wrapper a wrapper returned by `onPage`
 */
export function offPage(wrapper) {
  wrapper.page.body.removeEventListener(wrapper.type, wrapper.listener);
}

/** adds event handler to an element
 *
 * @param page {Page} the page
 * @param target {HTMLElement} an element the event designated for
 * @param params {Object} some config params to pass to the handler
 * @param type {String} event type
 * @param handler {function(page, target, params, event)} handler
 * @returns {Object} handler wrapper
 */
export function onTarget(page, target, params, type, handler) {
  const listener = (event) => handler(page, target, params, event)
  target.addEventListener(type, listener);
  return {page, target, type, listener};
}

/** removes event listener from an element
 * @param wrapper a wrapper returned by `onPage`
 */
export function offTarget(wrapper) {
  wrapper.target.removeEventListener(wrapper.type, wrapper.listener);
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