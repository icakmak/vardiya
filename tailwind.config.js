/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        // Özel vardiya renkleri
        shift: {
          blue: {
            bg: '#eff6ff', // Arka plan rengi (hafif ton)
            DEFAULT: '#1e40af', // Ana renk (koyu ton)
          },
          red: {
            bg: '#fef2f2',
            DEFAULT: '#b91c1c',
          },
          purple: {
            bg: '#faf5ff',
            DEFAULT: '#7e22ce',
          },
          pink: {
            bg: '#fdf2f8',
            DEFAULT: '#be185d',
          },
          yellow: {
            bg: '#fefce8',
            DEFAULT: '#a16207',
          },
          cyan: {
            bg: '#ecfeff',
            DEFAULT: '#0e7490',
          },
          orange: {
            bg: '#fff7ed',
            DEFAULT: '#c2410c',
          },
          lime: {
            bg: '#f7fee7',
            DEFAULT: '#4d7c0f',
          },
          violet: {
            bg: '#f5f3ff',
            DEFAULT: '#6d28d9',
          },
          rose: {
            bg: '#fff1f2',
            DEFAULT: '#be123c',
          },
          sky: {
            bg: '#f0f9ff',
            DEFAULT: '#0369a1',
          },
          amber: {
            bg: '#fffbeb',
            DEFAULT: '#b45309',
          },
          teal: {
            bg: '#f0fdfa',
            DEFAULT: '#0f766e',
          },
          fuchsia: {
            bg: '#fdf4ff',
            DEFAULT: '#a21caf',
          },
          green: {
            bg: '#f0fdf4',
            DEFAULT: '#15803d',
          },
          indigo: {
            bg: '#eef2ff',
            DEFAULT: '#4338ca',
          },
          emerald: {
            bg: '#ecfdf5',
            DEFAULT: '#047857',
          },
          gray: {
            bg: '#f9fafb',
            DEFAULT: '#374151',
          },
        },
      },
    },
  },
  plugins: [],
};
