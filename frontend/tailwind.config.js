/** @type {import('tailwindcss').Config} */

export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {

    extend: {

      colors: {

        primary: "#C67C4E",
        secondary: "#8B6F47",

        background: "#ECECEC",
        surface: "#E3E3E3",

        success: "#7FB069",
        warning: "#D4A574",
        error: "#A67C52",

        textPrimary: "#2B2B2B",
        textSecondary: "#5A5A5A"

      },

      borderRadius: {
        xl: "16px"
      },

      boxShadow: {

        neumorph:
          "8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff",

        insetSoft:
          "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff"

      }

    }

  },

  plugins: []

}