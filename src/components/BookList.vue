<script setup lang="ts">
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book']);
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
        <span>
          <strong>{{ book.title }}</strong> von {{ book.author }} ({{ book.releaseYear }})
        </span>
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
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}


.book-item:hover {
  background-color: #f9f9f9;
}

.book-item.active {
  background-color: #e8f5e9;
  border-left-color: #4CAF50;
}
</style>
