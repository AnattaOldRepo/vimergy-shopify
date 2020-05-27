---
to: "layouts/<%= h.inflection.dasherize(name) %>.vue"
---
<template>
  <div :class="$style.container">
    <slot />
  </div>
</template>

<style module lang="scss">
@import '@design';

.container {
  margin: 0 auto;
}
</style>
