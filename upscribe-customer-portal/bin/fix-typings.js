#!/usr/bin/env node

const fs = require('fs')

const fixes = {
  cypress: 'types/index.d.types',
  'source-map': 'source-map.d.ts',
}

for (const packageName in fixes) {
  const pkg = require(`${packageName}/package.json`)

  pkg.types = fixes[packageName]

  fs.writeFileSync(
    require.resolve(`${packageName}/package.json`),
    JSON.stringify(pkg, null, 2)
  )
}
