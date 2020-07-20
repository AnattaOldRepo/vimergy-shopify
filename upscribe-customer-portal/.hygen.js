const path = require('path')
const _ = require('lodash')

module.exports = {
  templates: __dirname + '/.templates',
  helpers: {
    basename(filename) {
      return path.basename(filename)
    },
    kebab(value) {
      return _.kebabCase(value)
    },
    page(value) {
      if (value.endsWith('/')) value += 'index'
      if (value.startsWith('/')) value = value.substring(1)

      return value
    },
  },
}
