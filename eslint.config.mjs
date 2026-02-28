const eslintConfig = [
  {
    ignores: [".next/**", "dist/**", "build/**", "node_modules/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    }
  }
];

export default eslintConfig;
