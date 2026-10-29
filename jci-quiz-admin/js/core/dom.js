// @ts-check
/**
 * Small DOM helpers. Text is always inserted as text (textContent / text
 * nodes), never parsed as HTML — so quiz text, student answers and API data
 * can never inject markup or scripts.
 */

/**
 * @typedef {Node | string | number | null | undefined | false} Child
 * @typedef {Object} ElProps
 * @property {string | string[]} [class]
 * @property {string} [text]
 * @property {Record<string, string | number | boolean | null | undefined>} [attrs]   Attributes; false/null/undefined skip
 * @property {Record<string, string>} [data]
 * @property {Record<string, EventListener>} [on]
 */

/**
 * Create an element.
 * Unknown keys in props are set as DOM properties (e.g. type, value, hidden, disabled, href).
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {ElProps & Record<string, unknown>} [props]
 * @param {...(Child | Child[])} children
 * @returns {HTMLElementTagNameMap[K]}
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'class') {
      node.className = Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key === 'attrs') {
      for (const [name, attr] of Object.entries(/** @type {Record<string, unknown>} */ (value))) {
        if (attr === false || attr === null || attr === undefined) continue;
        node.setAttribute(name, attr === true ? '' : String(attr));
      }
    } else if (key === 'data') {
      Object.assign(node.dataset, value);
    } else if (key === 'on') {
      for (const [type, handler] of Object.entries(/** @type {Record<string, EventListener>} */ (value))) {
        node.addEventListener(type, handler);
      }
    } else {
      /** @type {any} */ (node)[key] = value;
    }
  }
  append(node, ...children);
  return node;
}

/**
 * Append children; strings become text nodes.
 * @param {Node} parent
 * @param {...(Child | Child[])} children
 */
export function append(parent, ...children) {
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

/** @param {Element} node */
export function clear(node) {
  node.replaceChildren();
  return node;
}

/**
 * Add an event listener and get back a function that removes it.
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListener} handler
 * @param {AddEventListenerOptions} [options]
 */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/**
 * Event delegation: handle events from descendants matching a selector.
 * @param {Element | Document} root
 * @param {string} type
 * @param {string} selector
 * @param {(event: Event, match: Element) => void} handler
 */
export function delegate(root, type, selector, handler) {
  return on(root, type, (event) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (target && root.contains(target)) handler(event, target);
  });
}

/**
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {HTMLElement | null}
 */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {HTMLElement[]}
 */
export function qsa(selector, root = document) {
  return /** @type {HTMLElement[]} */ ([...root.querySelectorAll(selector)]);
}
