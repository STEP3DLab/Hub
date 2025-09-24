/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './reverse-additive.html',
    './js/**/*.{js,mjs}',
    './assets/**/*.html'
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 6px 30px rgba(15,23,42,.08)'
      }
    }
  },
  plugins: []
};
