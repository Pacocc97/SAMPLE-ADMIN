import { useEffect, useState } from "react";

/**
 * Custom hook that return boolean if the size passed is less than current window width.
 *
 * @param {number} size
 * @returns {boolean}
 */
export const useWindowWide = (size: number) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setWidth]);

  return width > size;
};
