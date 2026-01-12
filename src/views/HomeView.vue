<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

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

const handleDeleteRequest = async (id: number) => {
  if (selectedBook.value?.id === id) {
    selectedBook.value = null;
  }

  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await fetchBooks();
      console.log("Buch erfolgreich gelöscht");
    } else {
      console.error("Fehler beim Löschen, Server-Antwort:", response.status);
    }
  } catch (error) {
    console.error("Netzwerkfehler beim Löschen:", error);
  }
};

const handleFinished = () => {
  selectedBook.value = null;
  fetchBooks();
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">
    <h1>Bücherverwaltung</h1>

    <BookForm
      :book-to-edit="selectedBook"
      @book-created="handleFinished"
      @cancel-edit="selectedBook = null"
    />

    <BookList
      :books="books"
      @edit-book="handleEditRequest"
      @delete-book="handleDeleteRequest"
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}
</style>
