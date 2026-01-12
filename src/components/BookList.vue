<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
}>();

const emit = defineEmits<{
  (e: 'edit-book', book: Book): void;
  (e: 'delete-book', id: number): void;
}>();

const requestDelete = (bookId: number) => {
  if (confirm('Möchtest du dieses Buch wirklich löschen?')) {
    emit('delete-book', bookId);
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
      >
        <span><strong>{{ book.title }}</strong> von {{ book.author }} ({{ book.releaseYear }})</span>

        <button @click.stop="requestDelete(book.id)" style="margin-left: 10px; cursor: pointer;">
          🗑️
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.book-list-container {
  margin-top: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
}
.book-item {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between; /* Damit der Mülleimer rechts ist */
  align-items: center;
}
.book-item:hover {
  background-color: #e0e0e0;
}
</style>
