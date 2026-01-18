<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Book, BOOK_STATUS } from '../types/Book';

const props = defineProps<{
  bookToEdit: Book | null;
}>();

const emit = defineEmits(['book-created', 'cancel-edit']);

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);
const status = ref<string>(BOOK_STATUS.PLANNED);
const rating = ref(0);
const notification = ref<{ message: string, type: 'success' | 'error' } | null>(null);

const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
  notification.value = { message: msg, type };
  setTimeout(() => notification.value = null, 3000);
};

watch(() => props.bookToEdit, (newVal) => {
  if (newVal) {
    title.value = newVal.title;
    author.value = newVal.author;
    releaseYear.value = newVal.releaseYear;
    const currentStatus = (newVal.status as string) === 'Offen' ? BOOK_STATUS.READING : newVal.status;
    status.value = currentStatus || BOOK_STATUS.PLANNED;
    rating.value = newVal.rating || 0;
  } else {
    resetForm();
  }
}, { immediate: true });

const resetForm = () => {
  title.value = '';
  author.value = '';
  releaseYear.value = 2024;
  status.value = BOOK_STATUS.PLANNED;
  rating.value = 0;
  notification.value = null;
};

const setRating = (stars: number) => {
  rating.value = stars;
};

const submitForm = async () => {
  const finalRating = status.value === BOOK_STATUS.PLANNED ? 0 : rating.value;

  const bookData = {
    title: title.value,
    author: author.value,
    releaseYear: releaseYear.value,
    status: status.value,
    rating: finalRating
  };

  const isEdit = !!props.bookToEdit;
  const url = isEdit
    ? `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit?.id}`
    : 'https://webtech-backend-g4ak.onrender.com/api/v1/books';

  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Fehler beim Speichern');

    if (!isEdit) resetForm();
    emit('book-created');
    showNotification(isEdit ? 'Buch aktualisiert!' : 'Buch gespeichert!');

  } catch (error) {
    console.error(error);
    showNotification('Fehler beim Speichern.', 'error');
  }
};
</script>

<template>
  <div class="form-container">
    <button class="close-btn" @click="emit('cancel-edit')" title="Schließen">✕</button>

    <h3>{{ props.bookToEdit ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>

    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Titel:</label>
        <input id="title" v-model="title" type="text" required placeholder="Titel" />
      </div>

      <div class="form-group">
        <label for="author">Autor:</label>
        <input id="author" v-model="author" type="text" required placeholder="Autor" />
      </div>

      <div class="form-group">
        <label for="year">Jahr:</label>
        <input id="year" v-model="releaseYear" type="number" required />
      </div>

      <div class="form-group">
        <label for="status">Status:</label>
        <select id="status" v-model="status">
          <option :value="BOOK_STATUS.PLANNED">{{ BOOK_STATUS.PLANNED }}</option>
          <option :value="BOOK_STATUS.READING">{{ BOOK_STATUS.READING }}</option>
          <option :value="BOOK_STATUS.READ">{{ BOOK_STATUS.READ }}</option>
        </select>
      </div>

      <div class="form-group" v-if="status !== BOOK_STATUS.PLANNED">
        <label>Bewertung:</label>
        <div class="star-rating">
          <span
            v-for="star in 5"
            :key="star"
            @click="setRating(star)"
            :class="{ 'filled': star <= rating }"
          >
            ★
          </span>
        </div>
      </div>

      <div class="button-group">
        <button type="submit" class="btn-save">{{ props.bookToEdit ? 'Speichern' : 'Hinzufügen' }}</button>
        <button type="button" @click="emit('cancel-edit')" class="btn-cancel">Abbrechen</button>
      </div>
    </form>
  </div>
</template>

<style scoped>

.form-container {
  position: relative;
  background-color: #1e1e1e;
  padding: 25px 20px 20px;
  border-radius: 8px;
  color: #fff;
  border: 1px solid #333;
  height: fit-content;
}

/* X-Button Style */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #fff;
}

.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; color: #ccc; }
input, select { width: 100%; padding: 10px; border-radius: 4px; background-color: #2c2c2c; border: 1px solid #444; color: #fff; }

.star-rating { font-size: 24px; cursor: pointer; display: inline-block; }
.star-rating span { color: #555; transition: color 0.2s; padding: 0 2px; }
.star-rating span.filled { color: #FFD700; }
.star-rating span:hover { color: #ffe066; }

.button-group { display: flex; gap: 10px; margin-top: 20px; }
button:not(.close-btn) { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; }
.btn-save { background-color: #4CAF50; flex: 1; }
.btn-cancel { background-color: #757575; }

.notification { padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; font-weight: bold; }
.notification.success { background-color: rgba(76, 175, 80, 0.2); border: 1px solid #4CAF50; color: #4CAF50; }
.notification.error { background-color: rgba(198, 40, 40, 0.2); border: 1px solid #c62828; color: #ef5350; }
</style>
