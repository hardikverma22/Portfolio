/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
      },
    },
  },
  plugins: [],
};
