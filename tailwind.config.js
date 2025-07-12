/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matcha: '#809671',
        almond: '#E5E0D8',
        pistache: '#B3B792',
        chai: '#D2AB80',
        carob: '#725C3A',
        vanilla: '#E5D2B8',
        primary: {
          DEFAULT: '#809671', // matcha
          light: '#B3B792', // pistache
          dark: '#725C3A', // carob
        },
        secondary: {
          DEFAULT: '#D2AB80', // chai
          light: '#E5D2B8', // vanilla
          dark: '#E5E0D8', // almond
        },
      },
    },
  },
  plugins: [],
} 