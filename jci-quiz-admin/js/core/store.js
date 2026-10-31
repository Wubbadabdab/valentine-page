// @ts-check
/**
 * A tiny per-page state container: a state object plus subscribe.
 * Pages keep their data here; derived values come from pure functions.
 */

/**
 * @template {Record<string, any>} T
 * @param {T} initial
 */
export function createStore(initial) {
  let state = initial;
  /** @type {Set<(state: T, previous: T) => void>} */
  const listeners = new Set();

  return {
    /** @returns {T} */
    get() {
      return state;
    },
    /**
     * Merge a partial update and notify subscribers.
     * @param {Partial<T> | ((state: T) => Partial<T>)} patch
     */
    set(patch) {
      const previous = state;
      const changes = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...changes };
      listeners.forEach((listener) => listener(state, previous));
    },
    /**
     * @param {(state: T, previous: T) => void} listener
     * @returns {() => void} unsubscribe
     */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
