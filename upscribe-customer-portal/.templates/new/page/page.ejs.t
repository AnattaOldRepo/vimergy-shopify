---
to: "pages/<%= h.page(path) %>.vue"
---
<script>
export default {
  head: {
    title: 'Title',
    meta: [
      {
        name: 'description',
        content: 'Add description',
      },
    ],
  },
}
</script>

<template>
  <div>
    <%= h.inflection.titleize(path.replace(/-/g, '_')) %>
  </div>
</template>
<%

if (useStyles) { %>
<style lang="scss" scoped>
@import '@design';
</style>
<% } %>
