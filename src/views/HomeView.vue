<script setup lang="ts">
import { ref } from 'vue';
import{ type Book } from '../types/Book';
import BookList from "../components/BookList.vue";

const myBooks = ref<Book[]>([
  { id: 1, title: 'Der Name der Rose', author: 'Umberto Eco' },
  { id: 2, title: 'Die Tribute von Panem', author: 'Suzanne Collins' },
  { id: 3, title: 'Siddhartha', author: 'Hermann Hesse' },
]);
</script>

<template>
  <main>np
    <BookList :books="myBooks" />
  </main>
</template>
