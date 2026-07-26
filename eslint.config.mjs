import nextConfig from "eslint-config-next";

// StandardJS-style rules (standard/prettier) are deferred for now:
// eslint-config-standard hard-requires ESLint 8 as a peer, while
// eslint-config-next (16.x) requires ESLint >=9 — the two can't coexist,
// and forcing the install breaks further downstream (missing
// eslint-plugin-n). `neostandard` is the ESLint-9-compatible successor
// from the same maintainers if/when this gets revisited.
const eslintConfig = [
  {
    ignores: ["components/ui/**/*", ".next/**/*", "next-env.d.ts"],
  },
  ...nextConfig,
  {
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
          ],

          "newlines-between": "always",

          pathGroups: [
            {
              pattern: "@app/**",
              group: "external",
              position: "after",
            },
          ],

          pathGroupsExcludedImportTypes: ["builtin"],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "comma-dangle": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
      "no-undef": "off",
    },
  },
];

export default eslintConfig;
