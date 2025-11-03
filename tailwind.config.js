// tailwind.config.js

import { withUt } from "uploadthing/tw";

module.exports = withUt ({
  darkMode: 'class', // or 'media' for automatic dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});

