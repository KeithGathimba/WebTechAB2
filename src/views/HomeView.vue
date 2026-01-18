<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import type { Book } from '../types/Book';
import { BOOK_STATUS } from '../types/Book';

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

const toggleForm = () => {
  if (isFormVisible.value) {
    closeForm();
  } else {
    selectedBook.value = null;
    isFormVisible.value = true;
  }
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
  closeForm();
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
        closeForm();
      }
    } else {
      alert("Fehler beim Löschen des Buches.");
    }
  } catch (error) {
    console.error("Netzwerkfehler beim Löschen:", error);
  }
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">
    <h1>Bücherverwaltung</h1>

    <div class="toggle-header" @click="toggleForm">
      <span class="toggle-title">
        {{ selectedBook ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}
      </span>
      <span class="arrow" :class="{ 'arrow-down': isFormVisible }">▶</span>
    </div>

    <div v-show="isFormVisible" class="form-wrapper">
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
  color: #e0e0e0;
  margin-bottom: 30px;
}


.toggle-header {
  background-color: #2c3e50;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  transition: background-color 0.2s;
  user-select: none;
}

.toggle-header:hover {
  background-color: #34495e;
}

.toggle-title {
  font-weight: bold;
  font-size: 1.1rem;
}

.arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  display: inline-block;
}

.arrow-down {
  transform: rotate(90deg);
}

.form-wrapper {
  margin-bottom: 40px;

  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
