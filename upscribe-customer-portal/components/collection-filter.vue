<script>
export default {
  props: {
    collectionOption: {
      type: Array,
      required: true,
    },
    activeCollectionHandle: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
<div
  class="c-collectionFilter"
>
  <ul class="c-collectionFilter__inner">
    <li v-for="(collection, index) in collectionOption"
        :key="index"
        :data-id = "collection.handle"
        class="c-collectionFilter__headline"
        :class = "{'c-collectionFilter__headline--active': activeCollectionHandle === collection.handle}"
        >
        <span
          role="button"
          tabindex="0"
          @click="$emit('selectCollection', collection)">
          {{ collection.title }}
        </span>
    </li>
  </ul>
</div>
</template>

<style lang="scss">
@import '@design';

.c-collectionFilter {
  overflow-x: scroll;
  margin-bottom: 15px;
}

.c-collectionFilter__inner {
  display: flex;
  padding: 16px 0px 16px 50px;
  justify-content: flex-start;
  border-bottom: 1px solid $color-blue-light-border;
}

.c-collectionFilter__headline {
    list-style: none;
    white-space: nowrap;
    margin-right: 15px;
    cursor: pointer;

    &--active{
      font-weight: bold;
    }
}
</style>
