import antfu from "@antfu/eslint-config"
import next from "@next/eslint-plugin-next"

export default antfu({
  formatters: true,
  typescript: true,
  tailwindcss: true,
  nextjs: false,
  plugins: {
    "@next/next": next,
  },
  yaml: false,
  gitignore: false,
  autoRenamePlugins: false,
  rules: {
    "no-console": "off",
    "node/prefer-global/process": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "react-hooks/exhaustive-deps": "off",
    "regexp/no-super-linear-backtracking": "warn",
    "no-alert": "warn",
    "style/multiline-ternary": "off",
    "style/no-tabs": "off",
    "node/prefer-global/buffer": "off",
    "@next/next/google-font-display": "warn",
    "style/quotes": ["error", "double"],
  },
})
