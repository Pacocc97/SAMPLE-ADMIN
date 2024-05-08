// const config = {
/** @type {import("tailwindcss").Config} */
const config = {
  content: ["./src/**/*.{astro,html,ts,tsx}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

module.exports = config;
