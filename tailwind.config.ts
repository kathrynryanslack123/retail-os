import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16211d",
        moss: "#5a7f4a",
        lime: "#d7f171",
        sand: "#f7f3ea",
        ember: "#c85c47"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(22, 33, 29, 0.12)"
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;

