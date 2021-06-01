module.exports = {
  root: true,

  env: {
    browser: true,
    node: true
  },

  parserOptions: {
    parser: "babel-eslint"
  },

  plugins: ["prettier"],

  // add your custom rules here
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  },

  extends: [
    "prettier",
    "plugin:prettier/recommended",
    "plugin:vue/recommended",
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/prettier"
  ]
}
