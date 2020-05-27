const path = require('path')
const sassTrue = require('sass-true')
const glob = require('glob')

const sassTestFiles = glob.sync(
  path.resolve(__dirname, '../../design/**/*.spec.scss')
)

const designPath = path.resolve(__dirname, '../../design')
const setupFile = path.resolve(__dirname, 'testing-env.scss')

sassTestFiles.forEach((file) =>
  describe(
    '@design' +
      file
        .replace(designPath, '')
        .replace(/_(.*)\.spec.scss$/, (_, name) => name),
    () => {
      sassTrue.runSass(
        {
          file: file.replace(/\.spec.scss$/, '.unit.scss'),
          data: `@import '${setupFile}';
               @import '${file}';\n`,
        },
        describe,
        it
      )
    }
  )
)
