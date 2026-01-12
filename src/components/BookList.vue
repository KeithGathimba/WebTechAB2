<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
}>();

const emit = defineEmits<{
  (e: 'edit-book', book: Book): void
}>();
</script>

<template>
  <div class="book-list-container">
    <h2>Meine Bücher</h2>
    <p v-if="props.books.length === 0">Keine Bücher vorhanden. Klicke auf ein Buch zum Bearbeiten.</p>
    <ul>
      <li
        v-for="book in props.books"
        :key="book.id"
        @click="emit('edit-book', book)"
        class="book-item"
      >
        <strong>{{ book.title }}</strong> von {{ book.author }} aus {{ book.releaseYear }}
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
}

.book-item:hover {
  background-color: #e0e0e0;
}
</style>
