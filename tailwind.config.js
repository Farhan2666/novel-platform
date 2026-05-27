/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {
        border: "rgba(255,255,255,0.1)",
      },
    },
  },
  plugins: [],
};
