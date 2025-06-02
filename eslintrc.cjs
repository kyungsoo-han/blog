module.exports = {
    env: {
        browser: true,
        es2022: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "prettier"
    ],
    plugins: ["react"],
    rules: {
        "react/react-in-jsx-scope": "off",
        "no-unused-vars":"off",
        "react/prop-types":"off"
    },
    settings: {
        react: {
            version: "detect", // 없어도 되지만, "React version not specified" 경고 방지
        },
    },
};