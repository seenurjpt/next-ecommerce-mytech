/** @type {import('tailwindcss').config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-gray": "#B0BEC5",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
