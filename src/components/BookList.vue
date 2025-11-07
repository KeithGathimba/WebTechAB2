<script setup lang="ts">
import { defineProps } from 'vue';

import { type Book} from '../types/Book';

const props = defineProps<{
  books: Book[];
}>();
</script>
<template>
  <div class="book-list-container">
    <h2>Meine Bücher</h2>
    <ul>
      <li v-for="book in props.books" :key="book.id">
        <strong>{{ book.title }}</strong> von {{ book.author }}
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
