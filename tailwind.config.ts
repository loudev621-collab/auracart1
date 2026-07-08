import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f7fb",
          100: "#e8ecf8",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3"
        }
      }
    }
  },
  plugins: []
};
export default config;
