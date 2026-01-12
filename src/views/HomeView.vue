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

// NEU: Löschen-Logik
cconst handleDeleteRequest = async (id: number) => {
  if (selectedBook.value?.id === id) {
    selectedBook.value = null;
  }

  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${id}`, {
      method: 'DELETE'
    });

    // NEU: Status-Code anzeigen
    console.log("Delete Status:", response.status);

    if (response.ok) {
      await fetchBooks();
      alert("Gelöscht!");
    } else {
      // Zeigt dir den Fehler direkt an
      alert(`Fehler! Server antwortet mit Code: ${response.status}`);
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

    <div class="content-wrapper">
      <section class="form-section">
        <BookForm
          :book-to-edit="selectedBook"
          @book-created="handleFinished"
          @cancel-edit="selectedBook = null"
        />
      </section>

      <section class="list-section">
        <BookList
          :books="books"
          :selected-book-id="selectedBook?.id"
          @edit-book="handleEditRequest"
          @delete-book="handleDeleteRequest"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.content-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.form-section {
  flex: 1;
}

.list-section {
  flex: 1;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
}
</style>
