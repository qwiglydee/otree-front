> experimental work in progress
> 
> not intended for use in production
> 

# oTree WebComponents

A micro-framework of webcomponents to facilitate creating interactive pages for oTree apps.

- not dependent on any sophisticated frameworks and libraries
- easy to use, customize and extend without javascript toolchains

# Objectives
- decoupled components and utils, suitable for plain pages and live pages 
- aiming generic scheme: display stimulus/puzzle/task, receive response/solution/answer
- front-side iteration management (plain pages)
- back-side iteration management (live pages)
- simple state management based on events only
- simple scripting of main iteration logic
- customizable content of existing components
- styling of existing components
- creating user-defined components or pseudo-components (custom elems w/out classes)

# Intended architecture

- DataSource: a module for retrieving trials and handle user responses
- GameLogic: main game or iteration logic
- Page: WebComponents to hold page state, render it and handle user interactions

## DataSource
Provides methods to retrieve trial data and handle user responses.

Main API would be:
- `newTrial()`
- `handleResponse(trial, response)`

Expecting at least two varieties:
- LiveData: using websocket and server-side data
- FormData: using forms and client-side data

Asynchronous data loading such as retrieving images should be handled here.

## Game
Implements main iteration sequence or game logic.

The basic logic to be:
- get trial
- receive user response
- validate response
- (optionally, allow more response attempts)
- goto next trial

Some other puzzles or games would need to rewrite this component.

Could be stateless and implemented as function.

## WebComponents
Render page content and handle user inputs.

- `otree-page`: main component holding global current state and synchronizing it with other components
- `otree-something`: other components or pseudo-components (just bare custom element without class)

The global state is modified via global function or page component method.
Synchronization is performed by broadcasting `update` events to all `otree-*` components, without any explicit subscriptions or dependency tracking.

## Dynamic content

Elements should allow to take data from page state (a trial, a puzzle, user response, feedback, etc) and render it.

- restrict to only access global page state properties (no expressions evaluations or function calls)
- interpolating plain text
  - `<span>Your answer: ${response}, correct answer was: ${solution}</span>`
- interpolating (at least) class attributes
  - `<div class="stimulus-${stimulus.category}">...</div>`
- inserting images (which should be already loaded at data source level to avoid render delays), just src won't work
- conditional rendering using `if` or `switch` logic
  - `<div if="${feedback}">...render feedback...</div>` 
  - `<div switch="${feedback}"><span case="true" class="valid">✅</span><span case="false" class="invalid">❌</span></div>`
- maybe, transparent structural elements to avoid DOM cluttering
  - like `<ng-container>` 
  - or just generic `<otree-div>`, `<otree-span>`
