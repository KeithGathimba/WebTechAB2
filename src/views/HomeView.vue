<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);
const isFormVisible = ref(false);

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

const showCreateForm = () => {
  selectedBook.value = null;
  isFormVisible.value = true;
};

const handleEditRequest = (book: Book) => {
  selectedBook.value = book;
  isFormVisible.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleBookCreated = () => {
  selectedBook.value = null;
  isFormVisible.value = false;
  fetchBooks();
};

const closeForm = () => {
  selectedBook.value = null;
  isFormVisible.value = false;
};

const handleBookDeletedFromForm = (deletedId: number) => {
  selectedBook.value = null;
  isFormVisible.value = false;
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
        isFormVisible.value = false;
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

    <div v-if="!isFormVisible" class="action-bar">
      <button @click="showCreateForm" class="btn-create">
        + Neues Buch anlegen
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

h1 {
  text-align: center;
  color: #ffffff;
  margin-bottom: 30px;
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.btn-create {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-create:hover {
  background-color: #43a047;
}

.btn-create:active {
  transform: scale(0.98);
}

.form-wrapper {
  margin-bottom: 40px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
