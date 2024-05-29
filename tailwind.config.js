/** @type {import('tailwindcss').Config} */
const svgToDataUri = require("mini-svg-data-uri");

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        wave: 'url("/src/assets/wave.svg")',
        "wave-dark": 'url("/src/assets/wave-dark.svg")',
        "wave-white": 'url("/src/assets/wave-white.svg")',
        "wave-black": 'url("/src/assets/wave-black.svg")',
        "wave-grad": 'url("/src/assets/wave-grad.svg")',
        "custom-grad":
          "linear-gradient(180deg, rgba(135, 227, 250, 1) 0%, rgba(66, 116, 217, 1) 50%, rgba(27, 76, 131, 1) 100%)",
        "dark-custom-grad": "linear-gradient(180deg, rgba(35,35,35,1) 0%, rgba(35,35,35,1) 50%)",
      },
      colors: {
        primary: "#002B5B",
        secondary: "#87e3fa",
        tertiary: "#2962d6",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        archivo: ["Archivo Black", "sans-serif"],
      },
    },
  },
  plugins: [
    addVariablesForColors,
    function ({matchUtilities, theme}) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        {values: flattenColorPalette(theme("backgroundColor")), type: "color"}
      );
    },
  ],
};

import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

function addVariablesForColors({addBase, theme}) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
