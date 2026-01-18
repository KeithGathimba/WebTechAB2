<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);
const isFormVisible = ref(false); // Startzustand: Formular ist unsichtbar

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

// Button "Neues Buch": Formular öffnen, Auswahl leeren
const showCreateForm = () => {
  selectedBook.value = null;
  isFormVisible.value = true;
};

// Bearbeiten aus der Liste: Formular öffnen, Buch setzen, hochscrollen
const handleEditRequest = (book: Book) => {
  selectedBook.value = book;
  isFormVisible.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Nach Speichern: Formular schließen, Liste neu laden
const handleBookCreated = () => {
  selectedBook.value = null;
  isFormVisible.value = false;
  fetchBooks();
};

// Abbrechen: Formular schließen
const closeForm = () => {
  selectedBook.value = null;
  isFormVisible.value = false;
};

// Nach Löschen im Formular: Formular schließen, Buch aus Liste entfernen
const handleBookDeletedFromForm = (deletedId: number) => {
  closeForm();
  books.value = books.value.filter(book => book.id !== deletedId);
};

// Löschen in der Liste
const handleDeleteFromList = async (id: number) => {
  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      books.value = books.value.filter(book => book.id !== id);
      if (selectedBook.value?.id === id) {
        closeForm();
      }
    } else {
      console.error("Fehler beim Löschen.");
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">

    <div class="header-row">
      <h1>Bücherverwaltung</h1>

      <button v-if="!isFormVisible" @click="showCreateForm" class="btn-create">
        + Neues Buch
      </button>
    </div>

    <div v-if="isFormVisible" class="form-wrapper">
      <BookForm
        :book-to-edit="selectedBook"
        @book-created="handleBookCreated"
        @book-deleted="handleBookDeletedFromForm"
        @cancel-edit="closeForm"
      />
    </div>

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

.header-row {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 30px;
  min-height: 50px;
}

h1 {
  margin: 0;
  color: #e0e0e0;
  text-align: center;
}

.btn-create {
  position: absolute;
  right: 0;
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-create:hover {
  background-color: #43a047;
}

.form-wrapper {
  margin-bottom: 40px;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px;
  background-color: #1e1e1e;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
