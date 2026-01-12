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
    default: return '#757575'; //
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
        <div class="book-info">
          <strong>{{ book.title }}</strong>
          <span class="author">von {{ book.author }} ({{ book.releaseYear }})</span>
        </div>

        <span
          class="status-badge"
          :style="{ backgroundColor: getStatusColor(book.status) }"
        >
          {{ book.status || 'Offen' }}
        </span>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 6px solid transparent;
  transition: background-color 0.2s;
}

.book-item:hover { background-color: #f0f0f0; }
.book-item.active { background-color: #c8e6c9 !important; border-left-color: #2e7d32 !important; }

.book-info { display: flex; flex-direction: column; }
.author { font-size: 0.9em; color: #666; }

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-size: 0.8em;
  font-weight: bold;
  white-space: nowrap;
}
</style>
