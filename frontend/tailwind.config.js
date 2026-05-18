/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00ffcc",
        dark: "#0f172a",
        card: "#1e293b",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,255,204,0.15)",
      },
    },
  },
  plugins: [],
};
