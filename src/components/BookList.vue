<script setup lang="ts">
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book']);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Gelesen': return '#4CAF50';
    case 'Steht an': return '#FF9800';
    case 'Offen': return '#2196F3';
    default: return '#757575';
  }
};
</script>

<template>
  <div class="book-list-container">
    <h2>Meine Bücher</h2>
    <p v-if="props.books.length === 0">Keine Bücher vorhanden.</p>
    <ul>
      <li
        v-for="book in props.books"
        :key="book.id"
        @click="emit('edit-book', book)"
        class="book-item"
        :class="{ 'active': book.id === props.selectedBookId }"
      >
        <div class="book-content">
          <div class="book-header">
            <strong>{{ book.title }}</strong>
            <span
              class="status-badge"
              :style="{ backgroundColor: getStatusColor(book.status) }"
            >
              {{ book.status || 'Offen' }}
            </span>
          </div>

          <div class="author">von {{ book.author }} ({{ book.releaseYear }})</div>

          <div class="stars" v-if="book.rating > 0">
            <span v-for="n in book.rating" :key="n">★</span>
            <span v-for="n in (5 - book.rating)" :key="'empty'+n" style="color: #ccc;">★</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.book-list-container { margin-top: 20px; }
ul { list-style-type: none; padding: 0; }

.book-item {
  cursor: pointer;
  padding: 15px;
  border-bottom: 1px solid #eee;
  border-left: 6px solid transparent;
  transition: background-color 0.2s;
}

.book-item:hover { background-color: #f0f0f0; }
.book-item.active { background-color: #c8e6c9 !important; border-left-color: #2e7d32 !important; }

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.author { font-size: 0.9em; color: #666; margin-bottom: 5px; }

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
  font-size: 0.75em;
  font-weight: bold;
}


.stars {
  color: #FFD700;
  font-size: 1.1em;
}
</style>
