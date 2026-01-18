<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Book, BOOK_STATUS } from '../types/Book';

const props = defineProps<{
  books: Book[];
  selectedBookId?: number;
}>();

const emit = defineEmits(['edit-book', 'delete-book']);

const searchQuery = ref('');
const filterStatus = ref<string>('Alle');
const sortBy = ref<keyof Book>('title');
const sortOrder = ref<'asc' | 'desc'>('asc');
const showStats = ref(false);

const stats = computed(() => {
  const total = props.books.length;
  if (total === 0) return { total: 0, read: 0, reading: 0, avgRating: '0.0', progressPercent: 0 };

  const read = props.books.filter(b => b.status === BOOK_STATUS.READ).length;
  const reading = props.books.filter(b => b.status === BOOK_STATUS.READING).length;
  const ratedBooks = props.books.filter(b => b.rating > 0);
  const avgRating = ratedBooks.length > 0 ? (ratedBooks.reduce((acc, curr) => acc + curr.rating, 0) / ratedBooks.length).toFixed(1) : '0.0';
  const progressPercent = Math.round((read / total) * 100);

  return { total, read, reading, avgRating, progressPercent };
});

const filteredAndSortedBooks = computed(() => {
  let result = props.books.filter(book => {
    const term = searchQuery.value.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term);

    const matchesFilter = filterStatus.value === 'Alle' || book.status === filterStatus.value;

    return matchesSearch && matchesFilter;
  });

  return result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;

    const valA = a[sortBy.value];
    const valB = b[sortBy.value];

    if (valA === undefined && valB === undefined) return 0;
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;


    if (valA < valB) return -1 * modifier;
    if (valA > valB) return 1 * modifier;
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

const requestDelete = (book: Book) => {
  if (confirm(`Möchtest du das Buch "${book.title}" wirklich unwiderruflich löschen?`)) {
    emit('delete-book', book.id);
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case BOOK_STATUS.READ: return '#4CAF50';
    case BOOK_STATUS.READING: return '#2196F3';
    case 'Offen': return '#2196F3';
    case BOOK_STATUS.PLANNED: return '#FF9800';
    default: return '#9E9E9E';
  }
};
</script>

<template>
  <div class="book-list-container">
    <div class="list-header">
      <h2>Meine Sammlung</h2>
      <button @click="showStats = !showStats" class="toggle-stats-btn">
        {{ showStats ? 'Statistik verbergen' : 'Statistik anzeigen' }}
      </button>
    </div>

    <transition name="slide-fade">
      <div v-if="showStats" class="dashboard-panel">
        <div class="stats-grid">
          <div class="stat-box"><span class="stat-number">{{ stats.total }}</span><span class="stat-label">Bücher</span></div>
          <div class="stat-box"><span class="stat-number text-green">{{ stats.read }}</span><span class="stat-label">Gelesen</span></div>
          <div class="stat-box"><span class="stat-number text-orange">{{ stats.reading }}</span><span class="stat-label">Aktuell</span></div>
          <div class="stat-box"><span class="stat-number text-yellow">★ {{ stats.avgRating }}</span><span class="stat-label">Rating</span></div>
        </div>
        <div class="progress-wrapper">
          <div class="progress-labels"><span>Lesefortschritt</span><span>{{ stats.progressPercent }}%</span></div>
          <div class="progress-track"><div class="progress-fill" :style="{ width: stats.progressPercent + '%' }"></div></div>
        </div>
      </div>
    </transition>

    <div class="controls-bar">
      <div class="search-wrapper">
        <input v-model="searchQuery" type="text" placeholder="Titel oder Autor suchen..." class="search-input" />
        <span v-if="searchQuery" @click="searchQuery = ''" class="clear-icon">✕</span>
      </div>
      <div class="filter-wrapper">
        <span class="filter-label">Zeige:</span>
        <div class="filter-buttons">
          <button @click="filterStatus = 'Alle'" :class="{ active: filterStatus === 'Alle' }">Alle</button>
          <button @click="filterStatus = BOOK_STATUS.READING" :class="{ active: filterStatus === BOOK_STATUS.READING }">Lesend</button>
          <button @click="filterStatus = BOOK_STATUS.PLANNED" :class="{ active: filterStatus === BOOK_STATUS.PLANNED }">Steht an</button>
          <button @click="filterStatus = BOOK_STATUS.READ" :class="{ active: filterStatus === BOOK_STATUS.READ }">Gelesen</button>
        </div>
      </div>
      <div class="sort-wrapper">
        <span class="sort-label">Sortieren:</span>
        <div class="sort-buttons">
          <button @click="setSort('title')" :class="{ active: sortBy === 'title' }">Titel</button>
          <button @click="setSort('author')" :class="{ active: sortBy === 'author' }">Autor</button>
          <button @click="setSort('releaseYear')" :class="{ active: sortBy === 'releaseYear' }">Jahr</button>
          <button @click="setSort('rating')" :class="{ active: sortBy === 'rating' }">Sterne</button>
        </div>
      </div>
    </div>

    <div v-if="filteredAndSortedBooks.length === 0" class="empty-state">
      <p>Keine Bücher gefunden.</p>
    </div>

    <ul class="book-list">
      <li v-for="book in filteredAndSortedBooks" :key="book.id" @click="emit('edit-book', book)" class="book-card" :class="{ 'selected-card': book.id === props.selectedBookId }">
        <div class="card-content-wrapper">

          <div class="book-cover" v-if="book.coverUrl">
            <img :src="book.coverUrl" alt="Cover" />
          </div>
          <div class="book-cover placeholder" v-else>
            <span>📖</span>
          </div>

          <div class="card-content">
            <div class="card-top">
              <div class="card-header-left">
                <span class="book-title">{{ book.title }}</span>
                <span class="status-tag" :style="{ backgroundColor: getStatusColor(book.status) }">
                  {{ book.status || BOOK_STATUS.PLANNED }}
                </span>
              </div>
              <button class="delete-btn" @click.stop="requestDelete(book)" title="Buch löschen">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
              </button>
            </div>
            <div class="card-details">
              <span class="book-author">von {{ book.author }}</span>
              <span class="book-year">({{ book.releaseYear }})</span>
            </div>
            <div class="card-rating" v-if="book.rating > 0">
              <span v-for="n in book.rating" :key="n">★</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.book-list-container { margin-top: 40px; color: #e0e0e0; }

.card-content-wrapper { display: flex; gap: 15px; align-items: flex-start; }
.book-cover { flex-shrink: 0; width: 60px; height: 90px; border-radius: 4px; overflow: hidden; background-color: #2c2c2c; display: flex; align-items: center; justify-content: center; }
.book-cover img { width: 100%; height: 100%; object-fit: cover; }
.book-cover.placeholder { font-size: 1.5rem; color: #555; border: 1px solid #444; }
.card-content { flex-grow: 1; }


.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.list-header h2 { margin: 0; font-size: 1.8rem; font-weight: 600; color: #ffffff; }
.toggle-stats-btn { background: transparent; border: 1px solid #4CAF50; color: #4CAF50; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
.toggle-stats-btn:hover { background: #4CAF50; color: #ffffff; }
.dashboard-panel { background-color: #1e2a38; border-radius: 12px; padding: 25px; margin-bottom: 35px; border: 1px solid #2c3e50; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 20px; margin-bottom: 20px; text-align: center; }
.stat-box { display: flex; flex-direction: column; }
.stat-number { font-size: 1.8rem; font-weight: bold; }
.stat-label { font-size: 0.8rem; color: #8899a6; text-transform: uppercase; margin-top: 5px; }
.text-green { color: #66bb6a; } .text-orange { color: #ffa726; } .text-yellow { color: #fdd835; }
.progress-wrapper { margin-top: 15px; border-top: 1px solid #2c3e50; padding-top: 15px; }
.progress-labels { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #b0bec5; }
.progress-track { background: #2c3e50; height: 10px; border-radius: 5px; overflow: hidden; }
.progress-fill { background: #42b983; height: 100%; transition: width 0.5s ease; }
.controls-bar { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; background: #181818; padding: 20px; border-radius: 12px; border: 1px solid #333; }
.search-wrapper { position: relative; }
.search-input { width: 100%; padding: 12px 40px 12px 15px; border-radius: 8px; border: 1px solid #333; background: #252525; color: white; font-size: 1rem; }
.search-input:focus { outline: none; border-color: #42b983; }
.clear-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #777; }
.filter-wrapper, .sort-wrapper { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
.filter-label, .sort-label { color: #888; font-size: 0.9rem; min-width: 60px; }
.filter-buttons, .sort-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
.filter-buttons button, .sort-buttons button { background: #252525; border: 1px solid #333; color: #ccc; padding: 6px 14px; border-radius: 15px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
.filter-buttons button:hover, .sort-buttons button:hover { background: #333; }
.filter-buttons button.active, .sort-buttons button.active { background: #2c3e50; color: #42b983; border-color: #42b983; }
.book-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }
.book-card { background-color: #1e2a38; padding: 20px; border-radius: 10px; border: 1px solid #2c3e50; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.book-card:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); background-color: #233040; }
.selected-card { border-left: 5px solid #42b983; background-color: #1a232e !important; box-shadow: inset 0 0 0 1px #42b983; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.card-header-left { display: flex; flex-direction: column; gap: 5px; flex-grow: 1; }
.delete-btn { background: transparent; border: none; color: #ef5350; cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.2s; display: flex; align-items: center; justify-content: center; margin-left: 10px; }
.delete-btn:hover { background-color: rgba(239, 83, 80, 0.15); }
.book-title { font-size: 1.2rem; font-weight: bold; color: #fff; }
.status-tag { display: inline-block; width: fit-content; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; color: white; font-weight: 600; }
.card-details { font-size: 0.95rem; color: #b0bec5; margin-bottom: 10px; }
.book-year { margin-left: 5px; color: #78909c; }
.card-rating { color: #fdd835; letter-spacing: 2px; }
.empty-state { text-align: center; color: #666; padding: 40px; font-style: italic; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease-out; overflow: hidden; max-height: 500px; opacity: 1; }
.slide-fade-enter-from, .slide-fade-leave-to { max-height: 0; opacity: 0; }
</style>
