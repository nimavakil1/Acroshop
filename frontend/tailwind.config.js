/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acropaq brand colors from Shopify theme
        body: {
          bg: "#F5F5F5",
          text: "#2c2d2e",
        },
        heading: "#1a1c1d",
        accent: "#27ae60",
        "accent-blue": "#3f72e5",
        announcement: {
          bg: "#d1eef2",
          text: "#2C2D2E",
        },
        button: {
          bg: "#2c2d2e",
          text: "#ffffff",
        },
        footer: {
          bg: "#2c2d2e",
          text: "#DADCE0",
          link: "#aaaeb6",
          border: "#868d94",
        },
        card: {
          bg: "#ffffff",
        },
        sale: "#c62a32",
        marker: {
          green: "#baddc9",
          orange: "#ffdabb",
          red: "#fd6262",
          peach: "#ffe8d6",
        },
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1400px",
      },
      spacing: {
        section: "80px",
        "section-mobile": "40px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
        header: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        badge: "14px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
