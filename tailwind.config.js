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
        // Paleta base idéntica al tema oscuro por defecto de shadcn/ui
        background: "#09090b",     // zinc-950
        card: "#18181b",           // zinc-900
        border: "#27272a",         // zinc-800
        muted: "#71717a",          // zinc-500
        primary: "#10b981",        // emerald-500 (acento deportivo/activo)
      },
    },
  },
  plugins: [],
}