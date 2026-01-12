<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  bookToEdit: Book | null;
}>();

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);
const status = ref('Offen');
const rating = ref(0);

const emit = defineEmits(['book-created', 'cancel-edit', 'book-deleted']);

watch(() => props.bookToEdit, (newVal) => {
  if (newVal) {
    title.value = newVal.title;
    author.value = newVal.author;
    releaseYear.value = newVal.releaseYear;
    status.value = newVal.status || 'Offen';
    rating.value = newVal.rating || 0;
  } else {
    resetForm();
  }
}, { immediate: true });

const resetForm = () => {
  title.value = '';
  author.value = '';
  releaseYear.value = 2024;
  status.value = 'Offen';
  rating.value = 0;
};

const setRating = (stars: number) => {
  rating.value = stars;
};

const submitForm = async () => {
  const bookData = {
    title: title.value,
    author: author.value,
    releaseYear: releaseYear.value,
    status: status.value,
    rating: rating.value
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

    resetForm();
    emit('book-created');
    alert(isEdit ? 'Buch aktualisiert!' : 'Buch gespeichert!');

  } catch (error) {
    console.error(error);
    alert('Fehler beim Verarbeiten!');
  }
};

const deleteBook = async () => {
  if (!props.bookToEdit) return;
  if (!confirm('Wirklich löschen?')) return;

  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      emit('book-deleted', props.bookToEdit.id);
      resetForm();
      alert('Buch gelöscht!');
    } else {
      alert('Fehler beim Löschen.');
    }
  } catch (error) {
    alert('Netzwerkfehler.');
  }
};
</script>

<template>
  <div class="form-container">
    <h3>{{ props.bookToEdit ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>
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
          <option value="Offen">Offen</option>
          <option value="Steht an">Steht an</option>
          <option value="Gelesen">Gelesen</option>
        </select>
      </div>

      <div class="form-group">
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
        <button v-if="props.bookToEdit" type="button" @click="deleteBook" class="btn-delete">Löschen</button>
        <button v-if="props.bookToEdit" type="button" @click="emit('cancel-edit')" class="btn-cancel">Abbrechen</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container { background-color: #1e1e1e; padding: 20px; border-radius: 8px; color: #fff; }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; color: #ccc; }
input, select { width: 100%; padding: 10px; border-radius: 4px; background-color: #2c2c2c; border: 1px solid #444; color: #fff; }


.star-rating {
  font-size: 24px;
  cursor: pointer;
  display: inline-block;
}
.star-rating span {
  color: #555;
  transition: color 0.2s;
  padding: 0 2px;
}
.star-rating span.filled {
  color: #FFD700;
}
.star-rating span:hover {
  color: #ffe066;
}

.button-group { display: flex; gap: 10px; margin-top: 20px; }
button { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; }
.btn-save { background-color: #4CAF50; flex: 1; }
.btn-delete { background-color: #c62828; }
.btn-cancel { background-color: #757575; }
</style>
