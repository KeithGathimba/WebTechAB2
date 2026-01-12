<script setup lang="ts">
import { watch } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book']);

watch(() => props.selectedBookId, (newId) => {
  console.log("BookList hat neue ID empfangen zum Markieren:", newId);
});
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
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
  border-left: 6px solid transparent;
}

.book-item:hover {
  background-color: #f0f0f0;
}


.book-item.active {
  background-color: #c8e6c9 !important;
  border-left-color: #2e7d32 !important;
  font-weight: bold;
}
</style>
