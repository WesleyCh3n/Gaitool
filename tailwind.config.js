module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "*.{html,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#202225',
          800: '#2f3136',
          700: '#36393f',
          600: '#4f545c',
          400: '#d4d7dc',
          300: '#e3e5e8',
          200: '#ebedef',
          100: '#f2f3f5',
        },
      },
      spacing: {
        88: '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      "light",
      {
      "dark": {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
            primary: "#661AE6",
            "primary-content": "#ffffff",
            secondary: "#D926AA",
            "secondary-content": "#ffffff",
            accent: "#1FB2A5",
            "accent-content": "#ffffff",
            neutral: "#202225",
            "neutral-focus": "#202225",
            "neutral-content": "#A6ADBB",
            "base-100": "#36393f",
            "base-200": "#202225",
            "base-300": "#202225",
            "base-content": "#A6ADBB",
        },
      }
    ],
  },
}
