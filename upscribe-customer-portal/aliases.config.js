const prettier = require('prettier')
const path = require('path')
const fs = require('fs')

const aliases = {
  '@components': './components',
  '@globalCSS': './assets/css',
  '@design': './design',
  '@assets': './assets',
  '@state': './state',
  '@utils': './utils',
  '@mixins': './mixins',
  '@scripts': './scripts',
}

module.exports = {
  aliases,
  jest: {},
  nuxt: {},
  jsconfig: {},
}

for (const alias in aliases) {
  const aliasTo = aliases[alias]
  const aliasHasExtension = /\.\w+$/.test(aliasTo)
  if (
    aliasHasExtension ||
    fs.existsSync(path.resolve(__dirname, `${aliasTo}/index.js`))
  ) {
    module.exports.jest[`^${alias}$`] = aliasHasExtension
      ? `<rootDir>/${aliasTo}`
      : `<rootDir>/${aliasTo}/index.js`
  }
  module.exports.jest[`^${alias}/(.*)$`] = `<rootDir>/${aliasTo}/$1`
  module.exports.nuxt[alias] = path.resolve(__dirname, aliasTo)
  if (!aliasHasExtension) {
    module.exports.jsconfig[`${alias}/*`] = [aliasTo + '/*']
  }
  module.exports.jsconfig[alias] = aliasTo.includes('/index.')
    ? [aliasTo]
    : [
        aliasTo + '/index.js',
        aliasTo + '/index.json',
        aliasTo + '/index.vue',
        aliasTo + '/index.scss',
        aliasTo + '/index.css',
      ]
}

const jsconfigTemplate = require('./jsconfig.template')
const jsconfigPath = path.resolve(__dirname, 'jsconfig.json')

fs.writeFile(
  jsconfigPath,
  prettier.format(
    JSON.stringify({
      ...jsconfigTemplate,
      compilerOptions: {
        ...jsconfigTemplate.compilerOptions,
        paths: module.exports.jsconfig,
      },
    }),
    {
      ...require('./.prettierrc'),
      parser: 'json',
    }
  ),
  (error) => {
    if (error) {
      console.error(
        'Error while creating jsconfig.json from aliases.config.js.'
      )
      throw error
    }
  }
)
