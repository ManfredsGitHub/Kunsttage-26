/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lions: {
          blue: "#003B71",
          gold: "#C8A951",
        },
      },
    },
  },
  plugins: [],
};
