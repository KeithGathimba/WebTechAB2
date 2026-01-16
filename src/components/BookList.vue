<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book']);

const sortBy = ref<keyof Book>('title');
const sortOrder = ref<'asc' | 'desc'>('asc');

const sortedBooks = computed(() => {
  return [...props.books].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier;
    if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier;
    return 0;
  });
});

const setSort = (field: keyof Book) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

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

    <div class="sort-controls" v-if="props.books.length > 0">
      <span class="sort-label">Sortieren nach:</span>
      <div class="button-group">
        <button
          @click="setSort('title')"
          :class="{ active: sortBy === 'title' }"
        >
          Titel {{ sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button
          @click="setSort('author')"
          :class="{ active: sortBy === 'author' }"
        >
          Autor {{ sortBy === 'author' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button
          @click="setSort('releaseYear')"
          :class="{ active: sortBy === 'releaseYear' }"
        >
          Jahr {{ sortBy === 'releaseYear' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button
          @click="setSort('status')"
          :class="{ active: sortBy === 'status' }"
        >
          Status {{ sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button
          @click="setSort('rating')"
          :class="{ active: sortBy === 'rating' }"
        >
          Sterne {{ sortBy === 'rating' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
      </div>
    </div>

    <p v-if="props.books.length === 0">Keine Bücher vorhanden.</p>

    <ul>
      <li
        v-for="book in sortedBooks"
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
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.book-list-container { margin-top: 20px; }


.sort-controls {
  margin-bottom: 20px;
  background: transparent;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.sort-label {
  display: block;
  font-size: 0.85em;
  color: #888;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 6px 14px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85em;
  color: #555;
  transition: all 0.2s ease;
}

.button-group button:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.button-group button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #45a049;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}


ul { list-style-type: none; padding: 0; }

.book-item {
  cursor: pointer;
  padding: 15px;
  border-bottom: 1px solid #eee;
  border-left: 6px solid transparent;
  transition: background-color 0.2s;
}

.book-item:hover { background-color: #f9f9f9; }
.book-item.active { background-color: #e8f5e9 !important; border-left-color: #4CAF50 !important; }

.book-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.author { font-size: 0.9em; color: #666; margin-bottom: 5px; }
.status-badge { padding: 2px 8px; border-radius: 10px; color: white; font-size: 0.75em; font-weight: bold; }
.stars { color: #FFD700; font-size: 1.1em; }
</style>
