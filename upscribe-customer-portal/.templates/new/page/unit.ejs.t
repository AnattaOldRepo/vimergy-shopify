---
to: "pages/<%= h.page(path) %>.test.js"
---
<%
  const fileName = h.basename(h.page(path))
  const importName = h.inflection.camelize(fileName.replace(/-/g, '_')) + 'Page'
%>import <%= importName %> from './<%= fileName %>.vue'

describe('@views/<%= fileName %>', () => {
  it('is a valid view', () => {
    expect(<%= importName %>).toBeAPageComponent()
  })
})
