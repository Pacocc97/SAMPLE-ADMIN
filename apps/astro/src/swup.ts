/* eslint-disable @typescript-eslint/no-unsafe-call */
import SwupScrollPlugin from "@swup/scroll-plugin";
import Swup from "swup";

export const swup = new Swup({
  plugins: [
    new SwupScrollPlugin({
      doScrollingRightAway: false,
      animateScroll: false,
      scrollFriction: 0,
      scrollAcceleration: 0,
    }),
  ],
  animateHistoryBrowsing: true,
});
