/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0EA5E9", dark: "#0369A1", gold: "#F59E0B" },
      },
    },
  },
  plugins: [],
};
