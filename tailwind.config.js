/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16211d",
        sand: "#f7f3ea",
        moss: "#4f6f52",
        lime: "#d7f171",
        ember: "#c84d35"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(22, 33, 29, 0.10)"
      },
      fontFamily: {
        display: ["Aptos", "Segoe UI", "Helvetica Neue", "sans-serif"]
      }
    }
  },
  plugins: []
};
