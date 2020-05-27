---
to: "components/<%= h.kebab(name) %>.test.js"
---
<%
  const fileName = h.kebab(name)
  const importName = h.inflection.camelize(fileName.replace(/-/g, '_'))
%>import <%= importName %> from './<%= fileName %>.vue'

describe('@components/<%= importName %>', () => {
  it('exports a valid component', () => {
    expect(<%= importName %>).toBeAComponent()
  })
})
