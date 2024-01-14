export const $ = (/** @type {string} */ cssSelector) => {
  const elt = document.querySelector(cssSelector);
  if (elt === null) {
    throw new Error(`Cannot access element ${cssSelector}`);
  }
  return elt;
};
export const $texterea = (/** @type {string} */ cssSelector) => {
  /** @type {HTMLTextAreaElement | null} */
  const elt = document.querySelector(cssSelector);
  if (elt === null) {
    throw new Error(`Cannot access element ${cssSelector}`);
  }
  return elt;
};
