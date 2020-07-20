const isProductionLike = !!(
  process.env.NODE_ENV === 'production' ||
  process.env.CI ||
  process.env.PRE_COMMIT
)

module.exports = {
  /**
   * Limit eslint cascading and hierarchy
   *
   * See https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
   */
  root: true,

  /**
   * See https://eslint.org/docs/user-guide/configuring#specifying-parser-options
   */
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },

  extends: [
    'eslint:recommended',
    // https://github.com/vuejs/eslint-plugin-vue#bulb-rules
    'plugin:vue/recommended',
    // https://github.com/standard/standard
    'standard',
    // https://github.com/prettier/eslint-config-prettier
    'prettier',
    'prettier/standard',
    'prettier/vue',
  ],

  rules: {
    // Only allow debugger in development
    'no-debugger': isProductionLike ? 'error' : 'off',

    // Only allow `console.log` in development
    'no-console': isProductionLike
      ? ['error', { allow: ['warn', 'error'] }]
      : 'off',

    // Vue specific
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        ignores: [
          'component',
          'keep-alive',
          'router-link',
          'nuxt-link',
          'router-view',
          'nuxt',
          'slot',
          'template',
          'transition-group',
          'transition',
        ],
      },
    ],

    // Error Prevention
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.unit.js',
          '**/*.test.js',
          './*.config.js',
          './.*.js',
          'tests/**/*.js',
        ],
      },
    ],

    // Personal Reservations
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    camelcase: 'off',
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
  },

  overrides: [
    // Source files.
    {
      files: [
        // components
        'components/*.vue',
        'layouts/*.vue',
        'pages/**/*.vue',
        // Browser JavaScript
        'middleware/*',
        'plugins/**/*',
        'store/*',
        'store/**/*',
        'state/*',
        'utils/*',
        'mixins/**/*',
        'config.js',
        'scripts/**/*',
        // E2E specs
        'tests/e2e/**/*',
      ],
      parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module',
        allowImportExportEverywhere: true,
        ecmaFeatures: {
          modules: true,
        },
      },
      env: {
        browser: true,
      },
    },
    // Unit test files.
    {
      files: ['**/*.test.js', 'tests/unit/**/*.js'],
      parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module',
      },
      env: { jest: true },
      globals: {
        mount: false,
        shallowMount: false,
        shallowMountView: false,
        createComponentMocks: false,
        createModuleStore: false,
      },
    },
  ],
}
