<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from './components/BookForm.vue';
import BookList from './components/BookList.vue';
import { type Book } from './types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);

const fetchBooks = async () => {
  try {
    const response = await fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books');
    if (response.ok) {
      books.value = await response.json();
    }
  } catch (error) {
    console.error("Fehler beim Laden der Bücher:", error);
  }
};

const handleEditRequest = (book: Book) => {
  selectedBook.value = book;
};

const handleFinished = () => {
  selectedBook.value = null;
  fetchBooks();
};

onMounted(fetchBooks);
</script>

<template>
  <header>
    <h1>Bücherverwaltung</h1>
  </header>

  <main>
    <BookForm
      :book-to-edit="selectedBook"
      @book-created="handleFinished"
      @cancel-edit="selectedBook = null"
    />
    <BookList
      :books="books"
      @edit-book="handleEditRequest"
    />
  </main>
</template>

<style>
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
header {
  text-align: center;
  padding: 20px;
  background-color: #2c3e50;
  color: white;
}
</style>
