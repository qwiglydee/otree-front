/**
 * Creates spying function to track calls.
 * 
 * The resulting function has property spied { count, args }
 */
export function spy(orig) {
  let spied = {
    count: 0,
  };
  orig = orig || function(){};

  function wrapped() {
    spied.count ++;
    spied.args = Array.from(arguments);
    return orig.apply(null, arguments);
  }

  wrapped.spied = spied
  return wrapped;
}

export function flatmap(map) {
  return Object.fromEntries(map.entries());
} 
