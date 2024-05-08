/**
 * Calculates image height based on image width.
 * This sets the dimensions of the next image call.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} requestedWidth
 * @returns {number}
 */
export function calculateHeight(
  width: number,
  height: number,
  requestedWidth: number,
) {
  return Math.ceil((height * requestedWidth) / width);
}

/**
 * Calculates image width based on image height.
 * This sets the dimensions of the next image call.
 *
 * @param {number} height
 * @param {number} width
 * @param {number} requestedHeight
 * @returns {number}
 */
export function calculateWidth(
  height: number,
  width: number,
  requestedHeight: number,
) {
  return Math.ceil((width * requestedHeight) / height);
}
