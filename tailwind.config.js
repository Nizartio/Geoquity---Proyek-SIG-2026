/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'sans' font default (Inter)
        sans: ['Inter', 'sans-serif'],
        // 'display' untuk judul (Montserrat)
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}