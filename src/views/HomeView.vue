<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

// Zustand für die Liste der Bücher
const books = ref<Book[]>([]);

// Zustand für das aktuell zu bearbeitende Buch (null = Neuanlage)
const selectedBook = ref<Book | null>(null);

// Funktion zum Laden der Bücher vom Backend
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

// Wird aufgerufen, wenn in der Liste auf ein Buch geklickt wird
const handleEditRequest = (book: Book) => {
  selectedBook.value = book;
};

// Wird aufgerufen, wenn das Formular fertig ist (Speichern oder Abbrechen)
const handleFinished = () => {
  selectedBook.value = null;
  fetchBooks();
};

// Initiales Laden beim Start
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
