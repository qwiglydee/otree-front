/** 
 * Set of simple utils to manipulate DOM
 * @module utils/dom
 */

/** 
 * Loads an image asynchronously
 * 
 * Example:
 *   ```
 *   img = await loadImage("http://example.org/image.png");
 *   ```
 *  
 * @param {string} url url or dataurl to load
 * @returns {Promise} resolving to Image object
 */
export function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** 
 * Toggles visibility by setting 'display' css property.
 * 
 * @param {HTMLElement} elem
 * @param {boolean} display
 */
export function toggleDisplay(elem, display) {
  elem.style.display = display ? null : "none";
}

/** 
 * Toggles disabled state by `.disabled` property (for inputs), and also `ot-disabled` class.
 * 
 * @param {HTMLElement} elem
 * @param {boolean} disabled
 */
 export function toggleDisabled(elem, disabled) {
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

/** 
 * Checks if elem is disabled 
 * @param {HTMLElement} elem
 */
export function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

/** 
 * Sets or deletes text content 
 * @param {HTMLElement} elem
 * @param {string|null} text 
 */
export function setText(elem, text) {
  // NB: using `innerText` to render line breaks
  elem.innerText = text == null ? "" : text;
}

/** 
 * Sets element classes 
 * @param {HTMLElement} elem
 * @param {string[]} classes
 */
export function setClasses(elem, classes) {
  elem.classList.remove(...elem.classList);
  elem.classList.add(...classes);
}

/** 
 * Sets or deletes an attribute 
 * 
 * @param {HTMLElement} elem
 * @param {string} attr
 * @param {string|null} val
 */
export function setAttr(elem, attr, val) {
  if (val == null) {
    elem.removeAttribute(attr);
  } else {
    elem.setAttribute(attr, val);
  }
}

/** 
 * Inserts single child element or empties elem.
 *  
 * @param {HTMLElement} elem
 * @param {HTMLElement|null} child
 */
export function setChild(elem, child) {
  if (child == null) {
    elem.replaceChildren();
  } else {
    elem.replaceChildren(child);
  }
}

/** 
 * Checks if an elem is a text input or textarea
 *  
 * @param {HTMLElement} elem
 * @returns {boolean}
 */
export function isTextInput(elem) {
  return (elem.tagName == "INPUT" && elem.type == "text") || elem.tagName == "TEXTAREA";
}