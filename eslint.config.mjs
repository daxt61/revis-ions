/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    ignores: [".next/**"],
  },
];

export default eslintConfig;
