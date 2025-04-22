import tseslint from "typescript-eslint";

export default tseslint.config(
    tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/prefer-namespace-keyword": "off",
            "prefer-arrow-callback": "error",
            "require-await": "error",
            "no-var": "error",
            semi: ["error", "always"],
            quotes: ["error", "double"]
        }
    }
);
