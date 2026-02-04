// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- FIX: Use the new package name
    autoprefixer: {},
  },
}