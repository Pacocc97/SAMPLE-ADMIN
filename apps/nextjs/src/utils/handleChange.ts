import type { RefObject } from "react";

/**
 * Sample desc
 *
 * @param {React.KeyboardEvent<HTMLInputElement>} event
 * @returns {void}
 */
export function handleKeyChange(
  event: React.KeyboardEvent<HTMLInputElement>,
  callback: Function,
) {
  if (
    event.key === "Enter" &&
    (event.target as HTMLInputElement).value !== ""
  ) {
    event.preventDefault();
    const inputValue = (event.target as HTMLInputElement).value;
    callback(inputValue);
    (event.target as HTMLInputElement).value = "";
  }
}
export function handleBlurChange(
  event: React.FocusEvent<HTMLInputElement>,
  callback: Function,
) {
  if ((event.target as HTMLInputElement).value !== "") {
    event.preventDefault();
    const inputValue = (event.target as HTMLInputElement).value;
    callback(inputValue);
    (event.target as HTMLInputElement).value = "";
  }
}
export function handleButtonChange(
  inputValue: string | undefined,
  inputRef: RefObject<HTMLInputElement>,
  callback: Function,
) {
  if (inputValue) {
    callback(inputValue);
    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
  }
}
