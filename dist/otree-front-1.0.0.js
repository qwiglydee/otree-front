/** 
 * Utils to handle references to game state vars and manage their updates.
 * 
 * The references are just strings in form `obj.field.subfield`
 * 
 * @module utils/ref 
 */

/**
 * Checks if one ref is parent of other
 * 
 * `expect(isparentRef("foo.bar", "foo.bar.baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
function isparentRef(parentref, nestedref) {
  return nestedref.startsWith(parentref + ".");
}

/**
 * Strips common part of nested ref, making it local to parent
 *
 * `expect(getsubRef("foo.bar", "foo.bar.baz").to.be.eq("baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
function getsubRef(parentref, nestedref) {
  if (parentref == nestedref) {
    return "";
  } else if (nestedref.startsWith(parentref + ".")) {
    return nestedref.slice(parentref.length + 1);
  } else {
    throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
  }
}

/**
 * Extract a value from object by a ref
 * 
 * ```
 * let obj = {foo:{bar:"Bar"}};
 * expect(extractByRef("foo.bar", obj).to.be.eq("Bar")`
 * ```
 * 
 * @param {object} data 
 * @param {string} ref 
 * @returns {boolean}
 */
function extractByRef(ref, data) {
  return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
}

/**
 * Sets a value in object by ref.
 * The original object is modified in place
 * 
 * ```
 * let obj = {foo:{bar:"Bar"}};
 * updateByRef("foo.bar", obj, "newval");
 * expect(obj.foo.bar).to.be.eq("newval");
 * ```
 * @param {object} data 
 * @param {ref} ref 
 * @param {*} value 
 */
function updateByRef(ref, data, value) {
  function ins(obj, key) {
    return (obj[key] = {});
  }

  const path = ref.split("."),
    objpath = path.slice(0, -1),
    fld = path[path.length - 1];

  let obj = objpath.reduce((o, k) => (k in o ? o[k] : ins(o, k)), data);
  if (obj === undefined) throw new Error(`Incompatible ref ${ref}`);
  if (value === undefined) {
    delete obj[fld];
  } else {
    obj[fld] = value;
  }

  return data; 
}

const VAREXPR = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);

function parseVar(expr) {
  let match = VAREXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid expression for var: "${expr}"`);
  }

  let ref = match[0];
  return { ref };
}

function evalVar(parsed, changes) {
  const { ref } = parsed;

  return changes.pick(ref);
}


const CONDEXPR = new RegExp(/^([\w.]+)( ([!=]=) (.+))?$/);

function parseCond(expr) {
  let match = CONDEXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid condition expression: "${expr}"`);
  }

  let varmatch = VAREXPR.exec(match[1]);
  if (!varmatch) {
    throw new Error(`Invalid variable in condition expression: "${expr}"`);
  }

  let [_0, ref, _2, eq, val] = match;

  if (val) {
    try {
      val = JSON.parse(val.replaceAll("'", '"'));
    } catch {
      throw new Error(`Invalid value in condition expression: ${expr}`);
    }
  } else {
    val = undefined;
  }

  return { ref, eq, val };
}

function evalCond(parsed, changes) {
  const { ref, eq, val } = parsed;

  let value = changes.pick(ref);

  if (eq === undefined) return !!value;
  if (eq == "==") return value === val;
  if (eq == "!=") return value !== val;
}

const ASSIGNEXPR = new RegExp(/^([\w.]+) = (.+)?$/);

function parseAssign(expr) {
  let match = ASSIGNEXPR.exec(expr);

  if (!match) {
    throw new Error(`Invalid input expression: "${expr}"`);
  }

  let varmatch = VAREXPR.exec(match[1]);
  if (!varmatch) {
    throw new Error(`Invalid variable in input expression: "${expr}"`);
  }

  let [_0, ref, val] = match;

  try {
    val = JSON.parse(match[2].replaceAll("'", '"'));
  } catch {
    throw new Error(`Invalid value in assignment expression: ${expr}`);
  }

  return { ref, val };
}

/**
 * Checks if an event affects an expression
 *
 * @param {Event} event
 * @param {object} expr parsed expression containing ref to a var
 */
function affecting(parsed, event) {
  switch (event.type) {
    case "ot.reset":
      let topvars = event.detail;
      return topvars == null || topvars.some(v => v == parsed.ref || isparentRef(v, parsed.ref));
    case "ot.update":
      let changes = event.detail;
      return changes.affects(parsed.ref);
    default:
      return false;
  }
}

/**
 * Utils to handle changes of game state data
 *
 * @module utils/changes
 */

/**
 * A set of references to vars and their new values.
 *
 * The references are in form `obj.field.subfield` and correspond to a game state.
 */
class Changes extends Map {
  /**
   * @param {object} obj plain object describing changes
   */

  constructor(obj) {
    if (obj) {
      super(Array.from(Object.entries(obj)));
    } else {
      super();
    }
    // validate keys
    this.forEach((v, k) => parseVar(k));
  }

  prefix(pref) {
    let prefixed = new Changes();
    for(let [k, v] of this.entries()) {
      prefixed.set(`${pref}.${k}`, v);
    }
    return prefixed;
  }

  /**
   * Checks if the changeset affects a var or a subvar
   *
   * ```
   * let changes = new Changes({ 'foo.bar': something });
   * expect(changes.affect("foo.bar")).to.be.true;
   * expect(changes.affect("foo.bar.anything")).to.be.true;
   * expect(changes.affect("foo.*")).to.be.true;
   *
   * @param {*} fld
   */
  affects(fld) {
    if (fld.endsWith(".*")) {
      let top = fld.slice(0, -2);
      return this.has(top) || Array.from(this.keys()).some((key) => isparentRef(top, key));
    } else {
      return this.has(fld) || Array.from(this.keys()).some((key) => isparentRef(key, fld));
    }
  }

  /**
   * Picks single value from changeset, tracking reference across keys or nested objects.
   *
   * ```
   * let change = new Changes({ 'foo.bar': { baz: "Baz"} })
   * expect(change.pick('foo')).to.be.eq({ 'bar': { 'baz': "Baz" }})
   * expect(change.pick('foo.bar')).to.be.eq({ 'baz': "Baz" })
   * ```
   *
   */
  pick(fld) {
    if (this.has(fld)) {
      return this.get(fld);
    }
    // console.debug("picking", fld, "from", Array.from(this.keys()));

    // fld.subfld: something
    let nesting = Array.from(this.keys()).filter((k) => isparentRef(fld, k));
    // console.debug("nesting", nesting);
    if (nesting.length) {
      let result = {};
      for (let k of nesting) {
        let subfld = getsubRef(fld, k);
        result[subfld] = this.get(k);
      }
      return result;
    }

    // fld[top]: { fld[sub]: something }
    let splitting = Array.from(this.keys()).filter((k) => isparentRef(k, fld) && this.get(k) !== undefined);
    // console.debug("splitting", splitting);
    if (splitting.length) {
      for (let k of splitting) {
        let fldsub = getsubRef(k, fld);
        return extractByRef(fldsub, this.get(k))
      }
    }
  }

  /**
   * Apply changes
   *
   * Modify an obj by all the changes.
   *
   * Example:
   *    ```
   *    obj = { obj: { foo: { bar: "xxx" } } }
   *    changes = new Changes({ 'obj.foo': { bar: "Bar" } })
   *    changes.patch(obj)
   *
   *    obj == { obj: { foo: { bar: "Bar" } } }
   *    ```
   *
   * It works with arrays as well, when using indexes as subfields.
   *
   */
  patch(obj) {
    this.forEach((v, k) => {
      updateByRef(k, obj, v);
    });
  }
}

var changes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Changes: Changes
});

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
function loadImage(url) {
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
function toggleDisplay(elem, display) {
  elem.style.display = display ? null : "none";
}

/** 
 * Toggles disabled state by `.disabled` property (for inputs), and also `ot-disabled` class.
 * 
 * @param {HTMLElement} elem
 * @param {boolean} disabled
 */
 function toggleDisabled(elem, disabled) {
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

/** 
 * Checks if elem is disabled 
 * @param {HTMLElement} elem
 */
function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

/** 
 * Sets or deletes text content 
 * @param {HTMLElement} elem
 * @param {string|null} text 
 */
function setText(elem, text) {
  // NB: using `innerText` to render line breaks
  elem.innerText = text == null ? "" : text;
}

/** 
 * Sets element classes 
 * @param {HTMLElement} elem
 * @param {string[]} classes
 */
function setClasses(elem, classes) {
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
function setAttr(elem, attr, val) {
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
function setChild(elem, child) {
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
function isTextInput(elem) {
  return (elem.tagName == "INPUT" && elem.type == "text") || elem.tagName == "TEXTAREA";
}

var dom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  loadImage: loadImage,
  toggleDisplay: toggleDisplay,
  toggleDisabled: toggleDisabled,
  isDisabled: isDisabled,
  setText: setText,
  setClasses: setClasses,
  setAttr: setAttr,
  setChild: setChild,
  isTextInput: isTextInput
});

/** @module utils/random */

/**
 * Makes random choice from an array
 * 
 * @param {Array} choices
 */
function choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

var random = /*#__PURE__*/Object.freeze({
  __proto__: null,
  choice: choice
});

/** @module utils/timers */


/**
 * Async sleeping
 * 
 * @param {number} time in ms 
 * @returns {Promise}
 */
async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

/**
 * Delays function call
 * 
 * @param {Function} fn 
 * @param {number} delay in ms 
 * @returns {*} timer_id 
 */
function delay(fn, delay=0) {
    return window.setTimeout(fn, delay);
}

/**
 * Cancels delayed call
 * 
 * @param {*} id timer_id 
 */
function cancel(id) {
    window.clearTimeout(id);
}

/** 
 * Timers.
 * 
 * A set of timers with names
 */
class Timers {
    constructor() {
        this.timers = new Map();
    }

    /**
     * Delays function call
     * 
     * @param {sting} name 
     * @param {Function} fn 
     * @param {number} timeout in ms
     */
    delay(name, fn, timeout=0) {
        if (this.timers.has(name)) {
            cancel(this.timers.get(name));
        }
        this.timers.set(name, delay(fn, timeout));
    }

    /**
     * Cancels delayed calls by names.
     * 
     * @param  {...string} names one or more named calls to cancel, empty to cancel all 
     */
    cancel(...names) {
        if (names.length != 0) {
            names.forEach((n) => {
                cancel(this.timers.get(n));
                this.timers.delete(n);
            });
        } else {
            this.timers.forEach((v, k) => cancel(v));
            this.timers.clear();
        }
    }
}

var timers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sleep: sleep,
  delay: delay,
  cancel: cancel,
  Timers: Timers
});

/**
 * Preloading media accorfing to media_fields config of form: `{ field: 'image' }`.
 * Only images supported for now
 * 
 * @param {*} trial 
 * @param {*} media_fields 
 */
async function preloadMedia(trial, media_fields) {
  for (let [fld, mediatype] of Object.entries(media_fields)) {
    switch (mediatype) {
      case 'image':
        try {
          trial[fld] = await loadImage(trial[fld]);
        } catch {
          throw new Error(`Failed to load media ${trial[fld]}`);
        }
        break;
      default:
        throw new Error("Unsupported media type to preload");
    }      
  }  
}

var trials = /*#__PURE__*/Object.freeze({
  __proto__: null,
  preloadMedia: preloadMedia
});

/**
 * Begins measurement
 *
 * @param {string} name
 */
function begin(name) {
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
function end(name) {
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

var measurement = /*#__PURE__*/Object.freeze({
  __proto__: null,
  begin: begin,
  end: end
});

/* map of selector => class */
const registry = new Map();

/**
 * Registers a directive class.
 *
 * The {@link Page} sets up all registered directives on all found elements in html.
 * The elements a searched by provided selector, which is something like `[ot-something]` but actually can be anything.
 *
 * @param {string} selector a css selector for elements
 * @param {class} cls a class derived from {@link DirectiveBase}
 */
function registerDirective(selector, cls) {
  registry.set(selector, cls);
}

/**
 * Base class for directives.
 *
 * Used by all built-in directives and can be used to create custom directives.
 */
class DirectiveBase {
  /**
   * Returns a value from attribute `ot-name`.
   *
   * @param {string} [name=this.name] the param to get
   */
  getParam(attr) {
    return this.elem.getAttribute(`ot-${attr}`);
  }

  hasParam(attr) {
    return this.elem.hasAttribute(`ot-${attr}`);
  }

  /**
   * A directive instance is created for each matching element.
   *
   * @param {Page} page
   * @param {HTMLElement} elem
   */
  constructor(page, elem) {
    this.page = page;
    this.elem = elem;
    // this.handlers = new Map();  // TODO: cleaning up when detached
    this.init();
  }

  /**
   * Initializes directive.
   *
   * Use it to parse parameters from the element, and to init all the state.
   */
  init() {}

  /**
   * Binds an event handler for a global page event
   *
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   */
  onEvent(eventype, handler) {
    this.page.onEvent(eventype, handler.bind(this));
  }

  /**
   * Binds an event handler for a element event
   *
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   */
  onElemEvent(eventype, handler) {
    this.page.onElemEvent(this.elem, eventype, handler.bind(this));
  }

  /**
   * Sets up event handlers
   */
  setup() {
    if (this.onReset) this.onEvent("ot.reset", this.onReset);
    if (this.onUpdate) this.onEvent("ot.update", this.onUpdate);
  }
}

/**
 * Base for input
 * 
 * handles `ot-enabled` and freezing.
 */
class otEnablable extends DirectiveBase {
  init() {
    if (this.hasParam('enabled')) {
      this.cond = parseCond(this.getParam('enabled')); 
      this.enabled = false; 
    } else {
      this.cond = null;
      this.enabled = true; 
    }
  }

  onReset(event, vars) {
    if (!this.cond) {
      this.enabled = true;
    } else if(affecting(this.cond, event)) {
      this.enabled = false;
    }

    toggleDisabled(this.elem, !this.enabled);
  }

  onUpdate(event, changes) {
    if (this.cond && affecting(this.cond, event)) {
      this.enabled = evalCond(this.cond, changes);
      toggleDisabled(this.elem, !this.enabled);
    }
  }

  onFreezing(event, frozen) {
    toggleDisabled(this.elem, !this.enabled || frozen);
  }
}

/**
 * Directive `ot-input="var"` for native inputs: `<input>`, `<select>`, `<textarea>`.
 * 
 * It triggers {@link Page.event:input} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 * 
 * @hideconstructor
 */
class otRealInput extends otEnablable {
  init() {
    super.init();
    this.var = parseVar(this.getParam('input'));
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (isTextInput(this.elem)) {
      this.onElemEvent("keydown", this.onKey);
    } else {
      this.onElemEvent("change", this.onChange);
    }
  }

  onReset(event, vars) {
    super.onReset(event, vars);

    if (affecting(this.var, event)) {
      this.elem.value=null;
    }
  }

  onUpdate(event, changes) {
    super.onUpdate(event, changes);

    if (affecting(this.var, event)) {
      this.elem.value=evalVar(this.var, changes);
    }
  }

  onChange(event) {
    this.submit();
  }

  onKey(event) {
    if (event.code == "Enter") {
      this.submit();
    }
  }

  submit() {
    this.page.emitEvent('ot.input', {name: this.var.ref, value: this.elem.value});
  }
}

registerDirective(
  "[ot-input]:is(input, select, textarea)",
  otRealInput
);


function parseTriggers(directive) {
  return {
    click: directive.hasParam("click") || directive.elem.tagName == "BUTTON",
    touch: directive.hasParam("touch"),
    key: directive.hasParam("key") ? directive.getParam("key"): false,
  }; 
}


/**
 * Directive `ot-input="var = val"` for custom inputs: any `<div>`, `<span>`, `<button>`, `<kbd>`.
 * 
 * The directive should be accompanied with method of triggering `ot-
 * 
 * It triggers {@link Page.event:input} by a configred trigger:
 * - `ot-click` to trigger on click
 * - `ot-touch` to trigger on touch
 * - `ot-key="keycode" to trigger on keypress
 * 
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values  
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
* 
 * @hideconstructor
 */
class otCustomInput extends otEnablable {

  init() {
    super.init();
    this.ass = parseAssign(this.getParam('input'));
    this.trigger = parseTriggers(this);
  }

  setup() {
    if (!this.trigger.key && !this.trigger.touch && !this.trigger.click) {
      throw new Error("custom ot-input missing any ot-click ot-key ot-touch");
    }
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent('ot.input', {name: this.ass.ref, value: this.ass.val});
  }
}

registerDirective(
  "[ot-input]:not(input, select, textarea)",
  otCustomInput
);



/**
 * Directive `ot-emit="eventtype"` emits custom event when triggered by ot-click/ot-touch/ot-key.
 * 
 * Respect ot-enabled and freezing the same way as ot-input
 * 
 * @hideconstructor
 */
class otCustomEmit extends otEnablable {

  init() {
    super.init();
    this.evtype = this.getParam('emit');
    this.trigger = parseTriggers(this);
  }

  setup() {
    this.onEvent("ot.reset", this.onReset);
    this.onEvent("ot.update", this.onUpdate);
    this.onEvent("ot.freezing", this.onFreezing);
    if (this.trigger.key) this.onEvent("keydown", this.onKey);
    if (this.trigger.touch) this.onElemEvent("touchend", this.onClick);
    if (this.trigger.click) this.onElemEvent("click", this.onClick);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.submit();
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.submit();
  }

  submit() {
    this.page.emitEvent(this.evtype);
  }
}

registerDirective(
  "[ot-emit]",
  otCustomEmit
);

/**
 * Directive `ot-class="reference"`
 *
 * It adds a class with a value from `{@link Page.event:update}`.
 * All other existing lasses are preserved.
 */
class otClass extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("class"));
    this.defaults = Array.from(this.elem.classList);
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setClasses(this.elem, this.defaults);
    }
  }

  onUpdate(event,  changes) {
    if (affecting(this.var, event)) {
      let classes = this.defaults.slice();
      let val = evalVar(this.var, changes);
      if (!!val) {
        classes.push(val);
      }
      setClasses(this.elem, classes);
    }
  }
}

registerDirective("[ot-class]", otClass);

/**
 * Directive `ot-text="reference"`
 *
 * It inserts text content from {@link Page.event:update}.
 *
 * @hideconstructor
 */
class otText extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("text"));
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setText(this.elem, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      setText(this.elem, evalVar(this.var, changes));
    }
  }
}

registerDirective("[ot-text]", otText);

/**
 * Directive `ot-img="reference"`
 *
 * It inserts image element from {@link Page.event:update} inside its host.
 * The value in the Changes should be an instance of created and pre-loaded Image element.
 *
 * @hideconstructor
 */
class otImg extends DirectiveBase {
  init() {
    this.var = parseVar(this.getParam("img"));
  }

  onReset(event, vars) {
    if (affecting(this.var, event)) {
      setChild(this.elem, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      let img = evalVar(this.var, changes);
      if (!!img && !(img instanceof Image)) {
        throw new Error(`Invalid value for image: ${img}`);
      }
      setChild(this.elem, img);
    }
  }
}

registerDirective("[ot-img]", otImg);

/**
 * Directives `ot-attr-something="reference"`
 * 
 * The allowed attributes are: 
 * - `height` 
 * - `width` 
 * - `min` 
 * - `max` 
 * - `low` 
 * - `high` 
 * - `optimum` 
 * - `value` 
 * 
 * It deletes or sets value of the attribute to a value from {@link Page.event:update}.
 * 
 * @hideconstructor
 */
class otAttrBase extends DirectiveBase {
  get name() {
    throw new Error("name getter should be defined");
  }

  init() {
    this.var = parseVar(this.getParam(this.name));
  }

  onReset(event,  vars) {
    if (affecting(this.var, event)) {
      setAttr(this.elem, this.name, null);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.var, event)) {
      setAttr(this.elem, this.name, evalVar(this.var, changes));
    }
  }
}

const ALLOWED_ATTRIBS = ["height", "width", "min", "max", "low", "high", "optimum", "value"];

// create subclass for each attr with static property
// register them as `ot-something`
ALLOWED_ATTRIBS.forEach(attrname => {
  class otAttr extends otAttrBase {
    get name() {
      return attrname;
    }
  }  registerDirective(`[ot-${attrname}]`, otAttr);
});

/**
 * Directive `ot-when="var"`, `ot-when="var==val", ot-when="var===val"`.
 *
 * It shows/hides host element on {@link Page.event:update}.
 *
 * The `var` is a page var reference like `game.feedback`, the `val` is a primitive json expression
 * like "true" (boolean), "42" (number), "'foo'" (string).
 *
 * For `ot-when="var"` element shows when the `var` is defined.
 *
 * For `ot-when="var==val"` element shows when the `var` is defined and equal to the val.
 *
 * For `ot-when="var===val"` element shows when the `var` is defined and strictly equal to the val.
 *
 * @hideconstructor
 */
class otIf extends DirectiveBase {
  init() {
    this.cond = parseCond(this.getParam("if"));
  }

  onReset(event) {
    if (affecting(this.cond, event)) {
      toggleDisplay(this.elem, false);
    }
  }

  onUpdate(event, changes) {
    if (affecting(this.cond, event)) {
      toggleDisplay(this.elem, evalCond(this.cond, changes));
    }
  }
}

registerDirective("[ot-if]", otIf);

/** Main page.
 *
 * Centeral point of synchronization.
 *
 * Provides utils to fire and handle events.
 *
 * Installs all registered directives, found in html.
 *
 * *NB*: The installation happens only once, directives won't work in dynamically added html code.
 */
class Page {
  /**
   * @param {HTMLElement} [body=document.body] the element to attach all the events
   */
  constructor(body) {
    this.body = body || document.body;
    this.init();
  }

  init() {
    let page = this;
    registry.forEach((cls, sel) => {
      this.body.querySelectorAll(sel).forEach((elem) => {
        // console.debug(cls, sel, elem);
        let inst = new cls(page, elem);
        inst.setup();
      });
    });

    this.reset();

    this.onEvent("ot.status", (ev) => this.onStatus(ev.detail));
    this.onEvent("ot.input", (ev) => this.onInput(ev.detail.name, ev.detail.value));
    this.onEvent("ot.update", (ev) => this.onUpdate(ev.detail));
    this.onEvent("ot.timeout", (ev) => this.onTimeout(ev.detail));
  }

  /**
   * Binds an event handler to page
   *
   * @param {String} type type of an event
   * @param {Function} handler getting parameters (event, data)
   */
  onEvent(type, handler) {
    this.body.addEventListener(type, (ev) => handler(ev, ev.detail));
  }

  /**
   * Binds an event handler to an element
   *
   * @param {HTMLElement} elem an element
   * @param {String} type type of an event
   * @param {Function} handler getting parameters (event, data)
   */
  onElemEvent(elem, type, handler) {
    elem.addEventListener(type, (ev) => handler(ev, ev.detail));
  }

  /**
   * Waits for an event
   *
   * Returns a promise that resolves when an event happen.
   *
   * *NB*: this doesb't catch events happened before the waiting started. For such cases you need to save the promise and await for it later.
   *
   * Example:
   *
   *    await page.waitForEvent('ot.time.out'); // suspend script until timeout emitd
   *
   *    let waiting = page.waitForEvent('ot.timeout'); // start waiting without suspending
   *    // do some work during which a timeout might happen
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param {String} type of the event
   * @returns {Promise} resolved when event emitd
   */
  waitForEvent(type) {
    let target = this.body;
    return new Promise((resolve) => {
      function listener(event) {
        resolve(event);
        target.removeEventListener(type, listener);
      }
      target.addEventListener(type, listener);
    });
  }

  /**
   * Emits an event.
   *
   * The event is always a `CustomEvent`.
   * To emit built-in events, use built-in `target.dispatchEvent(event)`.
   *
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   */
  emitEvent(type, detail) {
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => this.body.dispatchEvent(new CustomEvent(type, { detail })));
  }

  /**
   * Emits an event on an element
   *
   * The event is always a `CustomEvent`.
   * To emit built-in events, use built-in `target.dispatchEvent(event)`.
   *
   * @param {HTMLElement} [target=page.body] an alternate element to emit at
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   */
  emitElemEvent(elem, type, detail) {
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => elem.dispatchEvent(new CustomEvent(type, { detail })));
  }

  /**
   * Signals reset of some page vars.
   *
   * @param {string[]} [vars] list of vars being reset, by default only ['game']
   * @fires Page.reset
   */
  reset(vars) {
    if (vars !== undefined && !Array.isArray(vars)) vars = [vars];
    this.emitEvent("ot.reset", vars);
  }

  /**
   * Signals changes of some page vars
   *
   * @param {object|Changes} changes
   * @fires Page.update
   */
  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.emitEvent("ot.update", changes);
  }

  /**
   * Emits timeout.
   *
   * @fires Schedule.timeout
   */
  timeout(time) {
    this.emitEvent("ot.timeout", time);
  }

  /**
   * Temporary disables inputs.
   *
   * @fires Page.freezing
   */
  freezeInputs() {
    this.emitEvent("ot.freezing", true);
  }

  /**
   * Reenables inputs.
   *
   * @fires Page.freezing
   */
  unfreezeInputs() {
    this.emitEvent("ot.freezing", false);
  }

  /**
   * Force native inputs to emit values
   *
   * @param {*} inpvar
   */
  submitInputs(inpvar) {
    this.body.querySelectorAll(`[ot-input="${inpvar}"]`).forEach((inp) => {
      this.emitEvent("ot.input", { name: inpvar, value: inp.value });
    });
  }

  /**
   * Force whole page to submit.
   */
  submit() {
    this.body.querySelector("form").submit();
  }

  /**
   * A handler for {@link Page.status}
   */
  onStatus(updated) {}

  /**
   * A handler for {@link Page.input}
   */
  onInput(name, value) {}

  /**
   * A handler for {@link Page.update}
   */
  onUpdate(changes) {}

  /**
   * A handler for {@link Schedule.timeout}
   */
  onTimeout(time) {}
}

/**
 * Indicates that a user started a game pressing 'Space' or something.
 * Triggered by directive `ot-ready`
 *
 * @event Page.ready
 * @property {string} type `ot.ready`
 */

/**
 * Indicates that some page vars have been reset
 *
 * @event Page.reset
 * @property {string} type `ot.reset`
 * @property {string[]} detail list of top-level vars
 */

/**
 * Indicates that page variables has changed.
 * Used by directives to update their content.
 *
 * @event Page.update
 * @property {string} type `ot.update`
 * @property {Changes} detail changes
 */

/**
 * Indicates that a user provided some input.
 *
 * @event Page.input
 * @property {string} type `ot.input`
 * @property {object} detail an object like `{field: value}` corresponding to directive `ot-input="field=value"`
 */

/**
 * Indicates timeout happened.
 *
 * @event Page.timeout
 * @property {string} type `ot.timeout`
 */

/**
 * Game logic
 *
 * Keeps game state and provides some utils to play.
 *
 * The game state is an arbitraty object holding all the data needed to play and display the game.
 * It is initially empty and updated via `update` method, that keeps it in sync with html directives.
 *
 * @property {object} conf constant config vars
 * @property {object} state main game data
 * @property {object} status set of flags indicating game status
 * @property {object} result result data
 * @property {object} error in form of `{ code, message }`
 * @property {number} iteration when in iterations loop
 */
class Game {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.config = {};

    this.trial = {};
    this.status = {};
    this.feedback = undefined;
  }

  /**
   * Sets config and resets game.
   *
   * The page is updated forr 'config' vars.
   *
   * @param {object} config
   * @fires Page.update
   */
  setConfig(config) {
    this.config = config;
    this.page.update({ config });
  }

  /**
   * Resets all trial-related data and game state.
   *
   * Sets `trial`, `status`, `feedback` to empty objects or nulls.
   * Updates page with all the affected objects.
   *
   * calls user-defined loadTrial()
   * 
   * @fires Page.reset
   */
  resetTrial() {
    this.trial = {};
    this.status = {};
    this.feedback = undefined;
    this.page.reset(["trial", "status", "feedback"]);
    this.loadTrial();
  }

  /**
   * Starts a trial
   *
   * Preloads media if needed.
   * Sets initial trial data, updates page.
   *
   * @param {Object} trial
   * @fires Page.update
   */
  async startTrial(trial) {
    this.trial = trial;

    if (this.config.media_fields) {
      await preloadMedia(trial, this.config.media_fields);
    }

    this.updateStatus({ trialStarted: true });
    this.page.update({ trial });
  }

  /**
   * Updates game state.
   *
   * Applies given changes to game state, using {@link Changes}
   *
   * @param {Object} updates the changes to apply
   * @fires Page.update
   */
  updateTrial(updates) {
    let changes = new Changes(updates);
    changes.patch(this.trial);
    this.page.update(changes.prefix("trial"));
  }

  /**
   * Sets game status.
   *
   * Provided flags are updated in game.status
   *
   * @param {Object} status
   * @fires Page.update
   * @fires Game.status
   */
  updateStatus(changes) {
    let status = this.status;
    Object.assign(status, changes);

    this.page.emitEvent("ot.status", changes);

    if (changes.trialStarted) {
      this.page.emitEvent("ot.trial.started");
    }
    if (changes.trialCompleted) {
      this.page.emitEvent("ot.trial.completed");
    }
    if (changes.gameOver) {
      this.page.emitEvent("ot.game.over");
    }

    this.page.update(new Changes(changes).prefix('status'));
  }

  /**
   * Sets feedback
   *
   * @param {string} code
   * @param {string} message
   * @fires Page.update
   */
  setFeedback(feedback) {
    this.feedback = feedback;
    this.page.update({ feedback: this.feedback });
  }

  /**
   * Clears feedback.
   *
   * @fires Page.reset
   */
  clearFeedback() {
    this.feedback = undefined;
    this.page.reset("feedback");
  }

  /**
   * Sets progress
   *
   * Calls hook onProgress(progress)
   *
   * @param {string} code
   * @param {string} message
   * @fires Page.update
   */
  setProgress(progress) {
    this.progress = progress;
    this.page.update({ progress: this.progress });
  }

  /**
   * Clears progress.
   *
   * @fires Page.reset
   */
  resetProgress() {
    this.progress = undefined;
    this.page.reset("progress");
  }

  /**
   * A hook called to retrieve initial Trial data.
   * Shuld eventually call startTrial(trial)
   */
  loadTrial() {
    throw new Error("Implement the `game.loadTrial`");
  }

  /**
   * Plays a game trial.
   *
   * It resets trial and waits for status update with trial_completed
   *
   * @returns {Promise} resolving with result when game completes
   */
  async playTrial() {
    this.resetTrial();
    await this.page.waitForEvent("ot.trial.completed");
  }

  async playIterations() {
    while (!this.status.gameOver) {
      await this.playTrial();
      await sleep(this.config.post_trial_pause);
    }
  }
}

/**
 * Schedule to toggle page flags at specifed time moments
 */

class Schedule {
  constructor(page) {
    this.page = page;
    this.timers = new Timers();
    this.phases = [];
    this.timeout = null;
  }

  /**
   * Setup schedule
   *
   * The `phases` is a list of vars augmented with `at` field indicating time in ms to update the vars.
   * ```
   * [
   *  { at: 0, phase: "something", ... }
   *  { at: 1000, foo: "Foo", ... }
   * }
   * ```
   *
   * The `timeout` in config is time in ms to emit timeout even t.
   *
   * @param {Object} phases list of phases
   */
  setup(phases) {
    this.phases = phases;
  }

  at(time, vars) {
    this.phases.push({ at: time, ...vars});
  }

  setTimeout(time) {
    this.timeout = time;
  }

  /**
   * Starts emitting all scheduled events
   */
  start() {
    if (this.phases) {
      this.phases.forEach((phase, i) => {
        let vars = Object.assign({}, phase);
        delete vars.at;

        this.timers.delay(
          `phase-${i}`,
          () => {
            this.page.update(vars);
          },
          phase.at
        );
      });
    }

    if (this.timeout) {
      this.timers.delay(
        `timeout`,
        () => {
          this.stop();
          this.page.timeout(this.timeout);
        },
        this.timeout
      );
    }
  }

  /**
   * Stops emitting scheduled events
   */
  stop() {
    this.timers.cancel();
  }
}

if (window.otree === undefined) {
  window.otree = {};
}


window.addEventListener('load', function() {
  window.otree.page = new Page(document.body);
  window.otree.game = new Game(otree.page);
  window.otree.schedule = new Schedule(otree.page);

  if (!window.main) {
    throw new Error("You need to define global `function main()` to make otree work");
  }
  window.main();
});

Object.assign(window.otree, {
  utils: {
    dom, random, timers, measurement, 
    changes, trials
  },
  directives: {
    DirectiveBase, registerDirective
  }
});
