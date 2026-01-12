<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  bookToEdit: Book | null;
}>();

const emit = defineEmits(['book-changed', 'cancel-edit']);

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);

watch(
  () => props.bookToEdit,
  (newVal) => {
    if (newVal) {
      title.value = newVal.title;
      author.value = newVal.author;
      releaseYear.value = newVal.releaseYear;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const resetForm = () => {
  title.value = '';
  author.value = '';
  releaseYear.value = 2024;
};

const submitForm = async () => {
  const bookData = {
    title: title.value,
    author: author.value,
    releaseYear: releaseYear.value
  };

  const isEdit = !!props.bookToEdit;
  const url = isEdit
    ? `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit!.id}`
    : 'https://webtech-backend-g4ak.onrender.com/api/v1/books';

  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern');
    }

    resetForm();
    emit('book-changed');
    alert(isEdit ? 'Buch erfolgreich aktualisiert!' : 'Buch erfolgreich gespeichert!');
  } catch (error) {
    console.error(error);
    alert('Es gab einen Fehler beim Verarbeiten!');
  }
};

const deleteBook = async () => {
  if (!props.bookToEdit) return;

  if (!confirm('Möchtest du dieses Buch wirklich löschen?')) return;

  try {
    const response = await fetch(
      `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit.id}`,
      {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Fehler beim Löschen');
    }

    resetForm();
    emit('book-changed');
    alert('Buch erfolgreich gelöscht!');
  } catch (error) {
    console.error(error);
    alert('Netzwerkfehler beim Löschen.');
  }
};
</script>

<template>
  <div class="form-container">
    <h3>{{ bookToEdit ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Titel:</label>
        <input id="title" v-model="title" type="text" required />
      </div>

      <div class="form-group">
        <label for="author">Autor:</label>
        <input id="author" v-model="author" type="text" required />
      </div>

      <div class="form-group">
        <label for="year">Erscheinungsjahr:</label>
        <input id="year" v-model="releaseYear" type="number" required />
      </div>

      <div class="button-group">
        <button type="submit" class="btn-save">
          {{ bookToEdit ? 'Speichern' : 'Hinzufügen' }}
        </button>

        <button
          v-if="bookToEdit"
          type="button"
          @click="deleteBook"
          class="btn-delete"
        >
          Löschen
        </button>

        <button
          v-if="bookToEdit"
          type="button"
          @click="emit('cancel-edit')"
          class="btn-cancel"
        >
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>
