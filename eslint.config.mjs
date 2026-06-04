import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];

export default config;
