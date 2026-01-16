<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);

const fetchBooks = async () => {
  try {
    const response = await fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books', {
      method: 'GET',
      cache: 'no-store'
    });
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

const handleBookCreated = () => {
  selectedBook.value = null;
  fetchBooks();
};

const handleBookDeletedFromForm = (deletedId: number) => {
  selectedBook.value = null;
  books.value = books.value.filter(book => book.id !== deletedId);
};

const handleDeleteFromList = async (id: number) => {
  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      books.value = books.value.filter(book => book.id !== id);

      if (selectedBook.value?.id === id) {
        selectedBook.value = null;
      }
    } else {
      console.error("Fehler beim Löschen des Buches (API-Status nicht OK).");
      alert("Fehler beim Löschen des Buches.");
    }
  } catch (error) {
    console.error("Netzwerkfehler beim Löschen:", error);
    alert("Netzwerkfehler beim Löschen.");
  }
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">
    <h1>Bücherverwaltung</h1>

    <BookForm
      :book-to-edit="selectedBook"
      @book-created="handleBookCreated"
      @book-deleted="handleBookDeletedFromForm"
      @cancel-edit="selectedBook = null"
    />

    <BookList
      :books="books"
      :selected-book-id="selectedBook?.id"
      @edit-book="handleEditRequest"
      @delete-book="handleDeleteFromList"
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
</style>
