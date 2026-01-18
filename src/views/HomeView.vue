<script setup lang="ts">
import { ref, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const exportToPdf = () => {
  const doc = new jsPDF();

  doc.text("Meine Bücherliste", 14, 10);

  const tableBody = books.value.map(book => [
    book.title,
    book.author,
    book.releaseYear.toString(),
    book.status,
    '★'.repeat(book.rating)
  ]);

  autoTable(doc, {
    head: [['Titel', 'Autor', 'Jahr', 'Status', 'Bewertung']],
    body: tableBody,
    startY: 20,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [44, 62, 80] } // Dunkelblau passend zum Theme
  });

  doc.save('buecherliste.pdf');
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
      alert("Fehler beim Löschen.");
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
      <button @click="exportToPdf" class="btn-export" title="Liste als PDF herunterladen">
        📄 PDF Export
      </button>

      <h1>Bücherverwaltung</h1>

      <button v-if="!isFormVisible" @click="showCreateForm" class="btn-create">
        + Neues Buch
      </button>
    </div>

    <div class="content-wrapper">

      <div class="list-section">
        <BookList
          :books="books"
          :selected-book-id="selectedBook?.id"
          @edit-book="handleEditRequest"
          @delete-book="handleDeleteFromList"
        />
      </div>

      <transition name="slide-right">
        <div v-if="isFormVisible" class="form-section">
          <BookForm
            :book-to-edit="selectedBook"
            @book-created="handleBookCreated"
            @cancel-edit="closeForm"
          />
        </div>
      </transition>

    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
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

h1 { margin: 0; color: #e0e0e0; text-align: center; }


.btn-export {
  position: absolute;
  left: 0; /* Links am Rand */
  background-color: #2c3e50;
  color: #ccc;
  border: 1px solid #444;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.btn-export:hover {
  background-color: #34495e;
  color: white;
  border-color: #666;
}


.btn-create {
  position: absolute;
  right: 0;
  background-color: #4CAF50;
  color: white;
}
</style>
