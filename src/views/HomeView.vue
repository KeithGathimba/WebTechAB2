<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);

const fetchBooks = async () => {
  try {
    // TRICK: Wir hängen die aktuelle Zeit an (?t=...),
    // damit der Browser NICHTS aus dem Cache lädt.
    const timestamp = Date.now();
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books?t=${timestamp}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' } // Doppelte Sicherheit
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

// Diese Funktion wird nach dem Löschen oder Erstellen aufgerufen
const handleFinished = () => {
  selectedBook.value = null; // Formular zurücksetzen
  fetchBooks(); // Liste SOFORT neu laden
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">
    <h1>Bücherverwaltung</h1>

    <BookForm
      :book-to-edit="selectedBook"
      @book-created="handleFinished"
      @book-deleted="handleFinished"
      @cancel-edit="selectedBook = null"
    />

    <BookList
      :books="books"
      :selected-book-id="selectedBook?.id"
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
