<script setup lang="ts">
import { ref, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import confetti from 'canvas-confetti'; // 1. Konfetti Import
import BookForm from '../components/BookForm.vue';
import BookList from '../components/BookList.vue';
import { type Book, BOOK_STATUS } from '../types/Book';

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);
const isFormVisible = ref(false);
const isLoading = ref(false);

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }
const toasts = ref<Toast[]>([]);

const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  const id = Date.now();
  toasts.value.push({ id, message: msg, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};

const fetchBooks = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books', {
      method: 'GET',
      cache: 'no-store'
    });
    if (response.ok) {
      books.value = await response.json();
    }
  } catch (error) {
    console.error("Fehler beim Laden:", error);
    addToast("Fehler beim Laden der Bücher", 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleStatusUpdate = async (book: Book, newStatus: string) => {
  const originalStatus = book.status;
  book.status = newStatus;

  if (newStatus === BOOK_STATUS.READ) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    addToast("Glückwunsch! Buch beendet 🎉", 'success');
  } else {
    addToast("Status aktualisiert", 'info');
  }

  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });

    if (!response.ok) {
      book.status = originalStatus;
      addToast("Fehler beim Speichern", 'error');
    }
  } catch (error) {
    book.status = originalStatus;
    console.error(error);
    addToast("Serverfehler", 'error');
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
    book.rating > 0 ? `${book.rating} / 5` : ''
  ]);

  autoTable(doc, {
    head: [['Titel', 'Autor', 'Jahr', 'Status', 'Bewertung']],
    body: tableBody,
    startY: 20,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [44, 62, 80] }
  });

  doc.save('buecherliste.pdf');
  addToast("PDF erfolgreich erstellt!", 'success');
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
  addToast("Buch erfolgreich gespeichert!", 'success');
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
      addToast("Buch gelöscht", 'success');
    } else {
      addToast("Fehler beim Löschen", 'error');
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchBooks);
</script>

<template>
  <main class="container">

    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>

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
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Bücher werden geladen...</p>
        </div>

        <BookList
          v-else
          :books="books"
          :selected-book-id="selectedBook?.id"
          @edit-book="handleEditRequest"
          @delete-book="handleDeleteFromList"
          @update-status="handleStatusUpdate"
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
.container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; }

.header-row { display: flex; justify-content: center; align-items: center; position: relative; margin-bottom: 30px; min-height: 50px; }
h1 { margin: 0; color: #e0e0e0; text-align: center; }

.btn-export { position: absolute; left: 0; background-color: #2c3e50; color: #ccc; border: 1px solid #444; padding: 8px 15px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
.btn-export:hover { background-color: #34495e; color: white; border-color: #666; }

.btn-create { position: absolute; right: 0; background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-create:hover { background-color: #43a047; }

.content-wrapper { display: flex; gap: 30px; align-items: flex-start; }
.list-section { flex: 1; min-width: 0; transition: all 0.3s ease; }
.form-section { width: 350px; flex-shrink: 0; }
.slide-right-enter-active, .slide-right-leave-active { transition: all 0.3s ease-out; }
.slide-right-enter-from, .slide-right-leave-to { opacity: 0; transform: translateX(20px); }


.loading-state { text-align: center; padding: 50px; color: #888; background-color: #1e2a38; border-radius: 12px; border: 1px dashed #444; }
.spinner { margin: 0 auto 15px; width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }


.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  min-width: 250px;
  display: flex;
  align-items: center;
}

.toast.success { background-color: #4CAF50; border-left: 5px solid #2E7D32; }
.toast.error { background-color: #ef5350; border-left: 5px solid #c62828; }
.toast.info { background-color: #2196F3; border-left: 5px solid #1565C0; }


.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateY(-30px); }

@media (max-width: 768px) {
  .content-wrapper { flex-direction: column-reverse; align-items: stretch; }
  .form-section { width: 100%; margin-bottom: 20px; }
  .header-row { flex-direction: column; gap: 15px; }
  .btn-export, .btn-create { position: static; width: 100%; }
}
</style>
