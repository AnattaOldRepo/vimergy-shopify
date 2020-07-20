// This is a template for a jsconfig.json file which will be
// generated when starting the dev server or a build.

module.exports = {
  include: ['**/*.vue', '**/*.js', '**/*.json'],
  exclude: ['node_modules', 'static'],
  compilerOptions: {
    baseUrl: '.',
    target: 'esnext',
    module: 'es2015',
    moduleResolution: 'node',
    resolveJsonModule: true,
    strict: true,

    // ...
    // `paths` will be automatically generated using aliases.config.js
    // ...
  },
}
