module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "*.{html,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ['emerald'],
  },
}
