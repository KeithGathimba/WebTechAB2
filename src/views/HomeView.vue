<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Book } from '../types/Book';
import BookList from "../components/BookList.vue";

const myBooks = ref<Book[]>([]);

onMounted(() => {
  fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books')
    .then(response => response.json())
    .then(data => {
      myBooks.value = data;
    })
    .catch(error => console.error('Fehler aufgetreten:', error));
});
</script>

<template>
  <main>
    <BookList :books="myBooks" />
  </main>
</template>
