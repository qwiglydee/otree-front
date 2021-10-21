# Directive-based MVC approach

# Model

A global object responsible for getting new trials, taking responses and providing feedbacks.

# Controller

A global object responsible for holding global page state (trial/puzzle, response, feedback, etc) and triggering notification events.

# Events

All events are triggered on `<body>` element of the page with event details.
- `ot.start{page}`: the game has been started
- `ot.reset{page}`: the page has been reset for new iteration
- `ot.update{page, changes}`: state has been updated
- `ot.display{page}`: the trial display sequence initiated

The `page` added to all events so that handler can access the main controller and full state.

# View directives

Introduced as data-attributes with `data-ot-something="..."` syntax.
A `var` in the syntax refers to any page state field like `trial.stimulus`.
A `val` refers to any string value, with 'true' or 'false' being autoconverted to boolean.

## Dynamic content

- `data-ot-when="var"`, `data-ot-when="var==val"`: shows host elem only when the var is defined or equal to the val
- `data-ot-text="var"`: inserts text content from the var
- `data-ot-img="var"`: inserts inner `<img>` element that whould be preloaded in the var
- `data-ot-class="var"`: adds class from the var, in addition to any existing classes
- `data-ot-attr-foo="var"`: sets any arbitrary attribute from the var
- `data-ot-display-*`: shows host element when `ot.display` events fires
  - `data-ot-display-delay="num"`: delay in ms from the `ot.display` event
  - `data-ot-display-exposure="num"`: amount of time in ms to show the element

## User inputs
- `data-ot-key="keycode"`: triggers on keypress
- `data-ot-touch`: triggers on touch
- `data-ot-click`: triggers on click
- `data-ot-start`: triggers `ot.start`
- `data-ot-input="var"`: triggers update of the var with value of host input element
- `data-ot-input="var=val"`: triggers update of the var with the given value
