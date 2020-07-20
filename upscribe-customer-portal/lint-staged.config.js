module.exports = {
  '*.js': ['yarn :eslint', 'yarn :prettier', 'git add'],
  '*.vue': ['yarn :eslint', 'yarn :stylelint', 'yarn :prettier', 'git add'],
  '*.json': ['yarn :prettier', 'git add'],
  '*.md': ['yarn :markdownlint', 'yarn :prettier', 'git add'],
  '*.{css,scss}': ['yarn :stylelint', 'yarn :prettier', 'git add'],
  '*.{png,jpeg,jpg,gif,svg}': ['imagemin-lint-staged', 'git add'],
}
