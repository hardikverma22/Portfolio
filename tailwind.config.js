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
      keyframes: {
        move: {
          '0%': { opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        opacity: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
      },
      animation: {
        'move': 'move 0.5s ease-in-out forwards',
        'moveSlow': 'move 1s ease-in forwards',
        'loadUp': 'opacity 1s ease-in forwards'
      },
    },
  },
  plugins: [require("tailwindcss-animation-delay"),],
}