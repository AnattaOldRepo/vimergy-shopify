<template>
    <div class='VuePagination' :class='props.theme.wrapper'>
        <nav class="pagination" :class='props.theme.nav'>

            <ul v-show="props.showPagination" class="pagination-list" :class="props.theme.list">

                <li v-if="props.hasEdgeNav" :class='props.theme.firstPage' @click="props.setFirstPage">
                    <a v-bind="{...props.aProps,...props.firstPageProps}" class="pagination-previous">{{props.texts.first}}</a>
                </li>

                <li v-if="props.hasChunksNav" :class='props.theme.prevChunk' @click="props.setPrevChunk">
                    <a v-bind="{...props.aProps,...props.prevChunkProps}" class="pagination-previous">{{props.texts.prevChunk}}</a>
                </li>

                <li :class="props.theme.prev" @click="props.setPrevPage">
                    <a v-bind="{...props.aProps,...props.prevProps}" class="pagination-previous">{{props.texts.prevPage}}</a>
                </li>

                <li v-for="page in props.pages" :key="page" :class="props.pageClasses(page)"
                    v-on="props.pageEvents(page)">
                    <a v-bind="props.aProps" :class="props.theme.link" class="pagination-link">{{page}}</a>
                </li>

                <li :class="props.theme.next" @click="props.setNextPage">
                    <a v-bind="{...props.aProps, ...props.nextProps}" class="pagination-next">{{props.texts.nextPage}}</a>
                </li>

                <li v-if="props.hasChunksNav" :class='props.theme.nextChunk' @click="props.setNextChunk">
                    <a v-bind="{...props.aProps, ...props.nextChunkProps}" class="pagination-next">{{props.texts.nextChunk}}</a>
                </li>

                <li v-if="props.hasEdgeNav" :class="props.theme.lastPage" @click="props.setLastPage">
                    <a v-bind="{...props.aProps, ...props.lastPageProps}" class="pagination-next">{{props.texts.last}}</a>
                </li>

            </ul>

        </nav>

        <p v-show="props.hasRecords" :class='props.theme.count'>{{props.count}}</p>
    </div>

</template>

<script>
    export default {
        props: ['props'],
    }
</script>

<style lang="scss">
@import '@design';

.VuePagination__pagination-item.active .pagination-link{
  background-color: $color-link;
  border-color: $color-link;
  color: $color-white;
}
</style>
