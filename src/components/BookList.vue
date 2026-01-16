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
      <h1>Meine Bücher</h1>
      <button @click="showStats = !showStats" class="stats-toggle-btn">
        {{ showStats ? 'Statistiken verbergen' : 'Statistiken anzeigen' }}
      </button>
    </div>

    <transition name="expand">
      <div v-if="showStats" class="stats-dashboard">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Bücher</span>
          </div>
          <div class="stat-card">
            <span class="stat-value text-green">{{ stats.read }}</span>
            <span class="stat-label">Gelesen</span>
          </div>
          <div class="stat-card">
            <span class="stat-value text-orange">{{ stats.reading }}</span>
            <span class="stat-label">Aktuell</span>
          </div>
          <div class="stat-card">
            <span class="stat-value text-yellow">★ {{ stats.avgRating }}</span>
            <span class="stat-label">Schnitt</span>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-info">
            <span>Lese-Fortschritt</span>
            <span>{{ stats.progressPercent }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: stats.progressPercent + '%' }"></div>
          </div>
        </div>
      </div>
    </transition>

    <div class="controls-wrapper">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Titel oder Autor suchen..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">✕</button>
      </div>

      <div class="sort-controls" v-if="props.books.length > 0">
        <span class="sort-label">Sortieren nach</span>
        <div class="button-group">
          <button v-for="field in (['title', 'author', 'releaseYear', 'status', 'rating'] as const)"
                  :key="field"
                  @click="setSort(field)"
                  :class="{ active: sortBy === field }">
            {{ field === 'releaseYear' ? 'Jahr' : field === 'rating' ? 'Sterne' : field.charAt(0).toUpperCase() + field.slice(1) }}
            <span class="sort-arrow">{{ sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</span>
          </button>
        </div>
      </div>
    </div>

    <p v-if="filteredAndSortedBooks.length === 0" class="empty-message">
      Keine passenden Bücher gefunden.
    </p>

    <ul class="book-list">
      <li
        v-for="book in filteredAndSortedBooks"
        :key="book.id"
        @click="emit('edit-book', book)"
        class="book-item"
        :class="{ 'active': book.id === props.selectedBookId }"
      >
        <div class="book-content">
          <div class="book-header">
            <span class="title">{{ book.title }}</span>
            <span class="status-badge" :style="{ backgroundColor: getStatusColor(book.status) }">
              {{ book.status || 'Offen' }}
            </span>
          </div>
          <div class="book-details">
            <span class="author">von {{ book.author }}</span>
            <span class="year">• {{ book.releaseYear }}</span>
          </div>
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
  --bg-color: #1a2634;
  --card-bg: #243447;
  --accent-blue: #3498db;
  --text-main: #e0e6ed;
  --text-dim: #94a3b8;

  background-color: var(--bg-color);
  color: var(--text-main);
  padding: 40px;
  border-radius: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

h1 { font-size: 2em; margin: 0; letter-spacing: -0.5px; }


.stats-dashboard {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 40px;
  border: 1px solid #2d4059;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card { text-align: center; }
.stat-value { font-size: 1.8em; font-weight: 700; display: block; }
.stat-label { font-size: 0.8em; color: var(--text-dim); text-transform: uppercase; margin-top: 8px; }

.progress-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #34495e; }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 500; }
.progress-bar-bg { height: 12px; background: #1a2634; border-radius: 6px; }


.controls-wrapper { margin-bottom: 30px; }
.search-container { margin-bottom: 25px; position: relative; }
.search-input {
  width: 100%;
  padding: 16px 20px;
  background: var(--card-bg);
  border: 1px solid #34495e;
  border-radius: 12px;
  color: white;
  font-size: 1.05em;
}

.sort-controls { padding-top: 10px; }
.sort-label { color: var(--text-dim); font-size: 0.9em; margin-bottom: 12px; display: block; }

.button-group { display: flex; gap: 12px; flex-wrap: wrap; }
.button-group button {
  background: transparent;
  border: 1px solid #34495e;
  color: var(--text-dim);
  padding: 8px 18px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-group button.active {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}


.book-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }

.book-item {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.book-item:hover { transform: translateY(-2px); background: #2d4059; }


.book-item.active {
  background: #2d425a !important;
  border-left-color: var(--accent-blue) !important;
}

.book-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.title { font-size: 1.2em; font-weight: 600; }
.book-details { color: var(--text-dim); margin-bottom: 12px; display: flex; gap: 8px; }


.text-green { color: #81c784; }
.text-orange { color: #ffb74d; }
.text-yellow { color: #ffd54f; }


.expand-enter-active, .expand-leave-active { transition: all 0.4s ease; max-height: 300px; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; transform: translateY(-10px); }
</style>
