import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16211d",
        moss: "#1f5a45",
        lime: "#d7f171",
        sand: "#f4efe4",
        ember: "#d4583d",
        sky: "#99dbf4"
      },
      boxShadow: {
        panel: "0 14px 40px rgba(20, 32, 27, 0.12)"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["Aptos", "Segoe UI", "Helvetica Neue", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
