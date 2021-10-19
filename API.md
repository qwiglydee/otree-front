# Directive-based MVC approach

# Model

A global object responsible for getting new trials, taking responses and providing feedbacks.

# Controller

A global object responsible for holding global page state (trial/puzzle, response, feedback, etc) and triggering notification events.

# Events

All events are triggered on `<body>` element of the page with event details.
- `ot.start` or `ot.start{state}`: the game has been started, or restarted with some state
- `ot.reset{state: current_state}`: the page has been reset for new iteration
- `ot.update{update: changes, state: state}`: state has been updated
- `ot.display`: the trial display sequence initiated

# View directives

Introduced as data-attributes with `data-ot-something="..."` syntax.
A `var` in the syntax refers to any page state field like `trial.stimulus`.
A `val` refers to any string value, with 'true' or 'false' being autoconverted to boolean.

- `data-ot-when="var"` `data-ot-when="var==val"`: shows host elem only when the var is defined or equal to the val
- `data-ot-text="var"`: inserts text content from the var
- `data-ot-img="var"`: inserts inner `<img>` element that whould be preloaded in the var
- `data-ot-class="var"`: adds class from the var, in addition to any existing classes
- `data-ot-attr-foo="var"`: sets any arbitrary attribute from the var
- `data-ot-display-*`: shows host element when `ot.display` events fires
  - `data-ot-display-delay="num"`: delay in ms from the `ot.display` event
  - `data-ot-display-exposure="num"`: amount of time in ms to show the element
- `data-ot-trigger="event"`: makes host element triggerable on "key", "touch" or "click" events
- `data-ot-keycode="keycode"`: specifies keycode for "key" trigger
- `data-ot-start`: trigers `ot.start` event
- `data-ot-input="var"`: updates var with value of host element (for any inputs/buttons or 'triggerable' elems)
- `data-ot-value="val"`: specifies value for arbitrary element
