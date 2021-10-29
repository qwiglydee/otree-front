export function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function random_choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

export function toggleDisplay(elem, display) {
  if (display === undefined) return;
  elem.style.display = display ? null : "none";
}

export function toggleDisabled(elem, disabled) {
  if (disabled === undefined) return;
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

export function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

export function setText(elem, text) {
  if (text === undefined) return;
  // NB: using `innerText` to render line breaks
  elem.innerText = text === null ? "" : text;
}

export function setClasses(elem, classes) {
  if (classes === undefined) return;
  elem.classList.remove(...elem.classList);
  elem.classList.add(...classes);
}

export function setAttr(elem, attr, val) {
  if (val === undefined) return;
  if (val === null) {
    elem.removeAttribute(attr);
  } else {
    elem.setAttribute(attr, val);
  }
}

export function setChild(elem, child) {
  if (child === undefined) return;
  if (child === null) {
    elem.replaceChildren();
  } else {
    elem.replaceChildren(child);
  }
}

/** Deferred
 *
 * A wrapper for a promise that you can resolve and check later, outside of closure.
 * ```
 * let dfd = new Deferred()
 * setTimeout(() => dfd.resolve(), 10000);
 * await dfd.promise; // waiting for the timeout
 * assert dfd.state === true;
 */

export class Deferred {
  constructor() {
    this.state = null;
    this.promise = new Promise((resolve, reject) => {
      this.reject = (reason) => {
        reject(reason);
        this.state = false;
      };
      this.resolve = (reason) => {
        resolve(reason);
        this.state = true;
      };
    });
  }
}
