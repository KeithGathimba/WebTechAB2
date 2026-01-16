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
  const open = props.books.filter(b => b.status === 'Offen' || !b.status).length;

  const ratedBooks = props.books.filter(b => b.rating > 0);
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((acc, curr) => acc + curr.rating, 0) / ratedBooks.length).toFixed(1)
    : '0.0';

  const progressPercent = total > 0 ? Math.round((read / total) * 100) : 0;

  return { total, read, reading, open, avgRating, progressPercent };
});

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
  <div class="book-list-container">
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
          <span class="stat-value" style="color: #4CAF50;">{{ stats.read }}</span>
          <span class="stat-label">Gelesen</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color: #FF9800;">{{ stats.reading }}</span>
          <span class="stat-label">Steht an</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color: #FFD700;">★ {{ stats.avgRating }}</span>
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
        <button @click="setSort('title')" :class="{ active: sortBy === 'title' }">
          Titel {{ sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button @click="setSort('author')" :class="{ active: sortBy === 'author' }">
          Autor {{ sortBy === 'author' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button @click="setSort('releaseYear')" :class="{ active: sortBy === 'releaseYear' }">
          Jahr {{ sortBy === 'releaseYear' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button @click="setSort('status')" :class="{ active: sortBy === 'status' }">
          Status {{ sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button @click="setSort('rating')" :class="{ active: sortBy === 'rating' }">
          Sterne {{ sortBy === 'rating' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
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
.book-list-container { margin-top: 20px; }

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-toggle-btn {
  background: none;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.2s;
}

.stats-toggle-btn:hover {
  background: #4CAF50;
  color: white;
}

/* Statistik Dashboard Styling */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  background: #fdfdfd;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.4em;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.75em;
  color: #888;
  text-transform: uppercase;
  margin-top: 4px;
}

.progress-container {
  grid-column: 1 / -1;
  margin-top: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #666;
  margin-bottom: 5px;
}

.progress-bar-bg {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.5s ease-out;
}


.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }


.search-container { position: relative; margin-bottom: 15px; }
.search-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}
.search-input:focus { border-color: #4CAF50; }
.clear-search {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #999; cursor: pointer;
}

.sort-controls { margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #eee; }
.sort-label { display: block; font-size: 0.85em; color: #888; margin-bottom: 10px; }
.button-group { display: flex; gap: 8px; flex-wrap: wrap; }
.button-group button {
  padding: 6px 14px; border: 1px solid #ddd; background: white; border-radius: 20px;
  cursor: pointer; font-size: 0.85em; transition: all 0.2s;
}
.button-group button.active { background-color: #4CAF50; color: white; border-color: #45a049; }

ul { list-style-type: none; padding: 0; }
.book-item {
  cursor: pointer; padding: 15px; border-bottom: 1px solid #eee; border-left: 6px solid transparent;
  transition: background-color 0.2s;
}
.book-item:hover { background-color: #f9f9f9; }
.book-item.active { background-color: #e8f5e9 !important; border-left-color: #4CAF50 !important; }
.status-badge { padding: 2px 8px; border-radius: 10px; color: white; font-size: 0.75em; font-weight: bold; }
.stars { color: #FFD700; }
</style>
