module.exports = [
  {
    type: 'input',
    name: 'path',
    message: 'URL Path:',
    validate(value) {
      if (!value.length) {
        return 'Page components must have a URL path.'
      }
      return true
    },
  },
  {
    type: 'confirm',
    name: 'useStyles',
    message: 'Add <style> block?',
  },
]
