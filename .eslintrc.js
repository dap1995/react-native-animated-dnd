module.exports = {
  "extends" : [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:flowtype/recommended",
    "airbnb-base"
  ],
  "plugins": [
    "react",
    "react-native",
    "jsx-a11y",
    "import",
    "flowtype",
  ],
  "rules": {
    "react/jsx-filename-extension": "off",
    "react/no-unescaped-entities": "off",
    "import/prefer-default-export": "off",
    "arrow-body-style" : "warn",
    "class-methods-use-this": "off",
    "disable-inline-comments": "off",
  },
  "globals": { "fetch": false }
};
