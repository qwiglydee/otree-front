# oTree WebComponents

A micro-framework for interactive pages for oTree apps.

- not dependent on any sophisticated frameworks and libraries
- easy to use and extend without javascript toolchains

# Architecture

The app consists of several components that communicate via global events.

## Page

The `Page` object is a central point of synchronization. It provides tools to fire and handle events.

The synchronization goes via global events fired on document body element. They have namespased type like `otree.page.start` or `otree.live.feedback` indicating corresponding layer.


## Directives

Directives are pieces of functionality attached to HTML code via custom attributes of form `data-ot-something="param"`.
The parameter can reference to a variable in game state. When the referenced variable is changed, directives react to that and update their content. 

Other kind of directives catch user input and convert it to events that can be handled by other components.

New custom directives can be created following simple scheme.

## Schedule

A `Schedule` describes some phases that should happen at particular moment of time since a game round started. 

The phases are described as set of flags and a time in ms. The set of flags can contain `display` and `input` to switch corresponding directives. It can be extended with arbitrary other flags.

Some phases can be defined with a name and triggered manually instead of happening at some time.

The schedule also measures reaction time for games that need it.

## Game logic 

An object of class `Game` holds arbitrary data as game state and provides generic utils to play rounds, iterations, and synchronize changes with the rest of the app.

Some particular game logic should be implemented via handlers attached to game events or live messages.

## Game state

The game state is any data needed for a game. It is an arbitrary object with any number of nested levels. 
Directives can reference to a variable in the state in the form `game.field.subfield` in their parameters.

Changes to the sate are propagated in form of an object of form like `{ 'game.field.subfield': newvalue, ... }`. Directives can detect if a referenced variable is affected by changes, either directly or via upper-level object.  

## Game status

The status is a set of fields that indicate meta-state of the game such as if the game is completed, if a trial is successful, or what player should move.
The status is not stored anywhere and only exists in events to indicate what happens.

It is propagated to directives in form of `{ 'status.field': somevalue }` so that they can also indicate some meta-state values. In particular, for multiple iterations it is used to indicate progress.

## Live communication

An object of class `Live` catches all live messages and converts them to global events. Both received and sent messages are indicated, so that other components can react to them in an arbitrary way.

The communication protocol requires all messages be of form `{ type: "sometype", ... }` so that type of a message can be determined. No other restrictions implied. 

# API documentation

Detailed documentation will eventually be generated and published somewhere.
