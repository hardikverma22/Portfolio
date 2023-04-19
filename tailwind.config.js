/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {


    extend: {
      backgroundImage: {
        'wave': 'url("/src/assets/wave.svg")',
        'wave-dark': 'url("/src/assets/wave-dark.svg")',
        'wave-white': 'url("/src/assets/wave-white.svg")',
        'wave-black': 'url("/src/assets/wave-black.svg")',
        'wave-grad': 'url("/src/assets/wave-grad.svg")',
      },
      animationDelay: {
        '1600': '1600ms',
        '1800': '1800ms',
      },
      colors: {
        'primary': '#002B5B',
        'secondary': '#87e3fa',
        'tertiary': '#2962d6',
        'custom-purple': '#f273f3'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
    },
  },
  plugins: [require("tailwindcss-animation-delay"),],
}