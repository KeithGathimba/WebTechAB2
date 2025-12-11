<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Book } from '../types/Book';
import BookList from "../components/BookList.vue";
import BookForm from "../components/BookForm.vue"; // 1. Importieren

const myBooks = ref<Book[]>([]);

const loadBooks = () => {
  fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books')
    .then(response => response.json())
    .then(data => {
      myBooks.value = data;
    })
    .catch(error => console.error('Fehler aufgetreten:', error));
};

onMounted(() => {
  loadBooks();
});

const refreshList = () => {
  loadBooks();
}
</script>

<template>
  <main>
    <h1>Mein Bücherregal</h1>
    <BookForm @book-created="refreshList" />

    <BookList :books="myBooks" />
  </main>
</template>
