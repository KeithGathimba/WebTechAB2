<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book']);

const searchQuery = ref('');
const sortBy = ref<keyof Book>('title');
const sortOrder = ref<'asc' | 'desc'>('asc');
const showStats = ref(false);

const stats = computed(() => {
  const total = props.books.length;
  const read = props.books.filter(b => b.status === 'Gelesen').length;
  const reading = props.books.filter(b => b.status === 'Steht an').length;

  const ratedBooks = props.books.filter(b => b.rating > 0);
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((acc, curr) => acc + curr.rating, 0) / ratedBooks.length).toFixed(1)
    : '0.0';

  const progressPercent = total > 0 ? Math.round((read / total) * 100) : 0;

  return { total, read, reading, avgRating, progressPercent };
});

// Filter- und Sortierlogik
const filteredAndSortedBooks = computed(() => {
  const filtered = props.books.filter(book => {
    const term = searchQuery.value.toLowerCase();
    return book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term);
  });

  return filtered.sort((a, b) => {
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
  <div class="book-list-container dark-theme">
    <div class="header-section">
      <h2>Meine Bücher</h2>
      <button @click="showStats = !showStats" class="stats-toggle-btn">
        {{ showStats ? 'Statistiken ausblenden' : 'Statistiken anzeigen' }}
      </button>
    </div>

    <transition name="fade">
      <div v-if="showStats" class="stats-dashboard">
        <div class="stat-card">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Gesamt</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color: #81c784;">{{ stats.read }}</span>
          <span class="stat-label">Gelesen</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color: #ffb74d;">{{ stats.reading }}</span>
          <span class="stat-label">Steht an</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color: #ffd54f;">★ {{ stats.avgRating }}</span>
          <span class="stat-label">Ø-Rating</span>
        </div>
        <div class="progress-container">
          <div class="progress-info">
            <span>Fortschritt</span>
            <span>{{ stats.progressPercent }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: stats.progressPercent + '%' }"></div>
          </div>
        </div>
      </div>
    </transition>

    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Nach Titel oder Autor suchen..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">✕</button>
    </div>

    <div class="sort-controls" v-if="props.books.length > 0">
      <span class="sort-label">Sortieren nach:</span>
      <div class="button-group">
        <button v-for="field in (['title', 'author', 'releaseYear', 'status', 'rating'] as const)"
                :key="field"
                @click="setSort(field)"
                :class="{ active: sortBy === field }">
          {{ field === 'releaseYear' ? 'Jahr' : field === 'rating' ? 'Sterne' : field.charAt(0).toUpperCase() + field.slice(1) }}
          {{ sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
      </div>
    </div>

    <p v-if="filteredAndSortedBooks.length === 0" class="empty-message">
      {{ props.books.length === 0 ? 'Keine Bücher vorhanden.' : 'Keine Treffer für deine Suche.' }}
    </p>

    <ul>
      <li
        v-for="book in filteredAndSortedBooks"
        :key="book.id"
        @click="emit('edit-book', book)"
        class="book-item"
        :class="{ 'active': book.id === props.selectedBookId }"
      >
        <div class="book-content">
          <div class="book-header">
            <strong>{{ book.title }}</strong>
            <span class="status-badge" :style="{ backgroundColor: getStatusColor(book.status) }">
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

.dark-theme {
  background-color: #1a2634;
  color: #e0e0e0;
  padding: 20px;
  border-radius: 12px;
}

.header-section h2 { color: #ffffff; }

.stats-toggle-btn {
  background: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.stats-toggle-btn:hover { background: #4CAF50; color: white; }


.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  background: #253345;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #34495e;
  margin-bottom: 25px;
}

.stat-value { font-size: 1.4em; font-weight: bold; color: #ffffff; }
.stat-label { color: #94a3b8; }

.progress-bar-bg { background: #34495e; }
.progress-bar-fill { background: #4CAF50; }


.search-input {
  width: 100%;
  padding: 12px 15px;
  background: #2c3e50;
  border: 1px solid #34495e;
  border-radius: 8px;
  color: white;
  outline: none;
}

.sort-controls { border-bottom: 1px solid #34495e; }
.button-group button {
  background: #2c3e50;
  border: 1px solid #34495e;
  color: #bdc3c7;
  border-radius: 20px;
  padding: 6px 14px;
  cursor: pointer;
}

.button-group button.active {
  background-color: #3498db;
  color: white;
  border-color: #2980b9;
}

.book-item {
  border-bottom: 1px solid #2c3e50;
  border-left: 6px solid transparent;
  transition: all 0.2s;
}

.book-item:hover { background-color: #2c3e50; }


.book-item.active {
  background-color: #243b55 !important;
  border-left-color: #3498db !important;
  box-shadow: inset 0 0 10px rgba(52, 152, 219, 0.2);
}

.author { color: #94a3b8; }
.stars { color: #ffd54f; }
.empty-message { color: #7f8c8d; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
