<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits<{
  (e: 'edit-book', book: Book): void;
  (e: 'delete-book', id: number): void;
}>();
</script>

<template>
  <div class="book-list-container">
    <h2>Meine Bücher</h2>
    <p v-if="props.books.length === 0" class="empty-msg">Keine Bücher vorhanden.</p>

    <ul v-else class="list">
      <li
        v-for="book in props.books"
        :key="book.id"
        @click="emit('edit-book', book)"
        class="book-item"
        :class="{ 'is-selected': book.id === props.selectedBookId }"
      >
        <div class="book-content">
          <span class="book-title">{{ book.title }}</span>
          <span class="book-info">von {{ book.author }} ({{ book.releaseYear }})</span>
        </div>

        <button
          class="btn-delete"
          @click.stop="emit('delete-book', book.id)"
          title="Buch löschen"
        >
          🗑️
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.book-list-container {
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  color: #fff;
}

h2 {
  margin-top: 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.empty-msg {
  color: #888;
  font-style: italic;
}

.list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.book-item {
  cursor: pointer;
  padding: 12px;
  border-bottom: 1px solid #333;
  transition: all 0.2s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-item:last-child {
  border-bottom: none;
}

.book-content {
  display: flex;
  flex-direction: column;
}

/* Klick-Status */
.is-selected .book-title {
  font-weight: 900;
  color: #4CAF50;
  text-decoration: underline;
}

/* Hover-Effekt */
.book-item:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
  transform: scale(1.02);
  border-radius: 4px;
}

.book-item:hover .book-info {
  color: #000000;
}

.book-title {
  font-size: 1.1em;
  margin-bottom: 4px;
}

.book-info {
  font-size: 0.9em;
  color: #aaa;
}


.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  opacity: 0.7;
}

.btn-delete:hover {
  background-color: #ffcccc;
  opacity: 1;
  transform: scale(1.1);
}


.book-item:hover .btn-delete {
  filter: grayscale(0%);
}
</style>
