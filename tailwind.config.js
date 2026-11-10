/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ig: {
          black: "#000000",
          surface: "#121212",
          elevated: "#1e1e1e",
          border: "#262626",
          muted: "#737373",
          secondary: "#a8a8a8",
        }
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      }
    },
  },
  plugins: [],
}