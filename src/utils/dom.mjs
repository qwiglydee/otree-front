export function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function toggleDisplay(elem, display) {
  elem.style.display = display ? null : "none";
}

export function toggleDisabled(elem, disabled) {
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

export function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

export function setText(elem, text) {
  // NB: using `innerText` to render line breaks
  elem.innerText = text == null ? "" : text;
}

export function setClasses(elem, classes) {
  elem.classList.remove(...elem.classList);
  elem.classList.add(...classes);
}

export function setAttr(elem, attr, val) {
  if (val == null) {
    elem.removeAttribute(attr);
  } else {
    elem.setAttribute(attr, val);
  }
}

export function setChild(elem, child) {
  if (child == null) {
    elem.replaceChildren();
  } else {
    elem.replaceChildren(child);
  }
}

export function isTextInput(elem) {
  return (elem.tagName == "INPUT" && elem.type == "text") || elem.tagName == "TEXTAREA";
}