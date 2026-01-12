<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  bookToEdit: Book | null;
}>();

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);

const emit = defineEmits(['book-created', 'cancel-edit']);

// Falls bookToEdit geändert wird (z.B. durch Klick in der Liste), füllen wir das Formular
watch(() => props.bookToEdit, (newBook) => {
  if (newBook) {
    title.value = newBook.title;
    author.value = newBook.author;
    releaseYear.value = newBook.releaseYear;
  } else {
    resetForm();
  }
}, { immediate: true });

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

  try {
    const isEdit = !!props.bookToEdit;
    const url = isEdit
      ? `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit?.id}`
      : 'https://webtech-backend-g4ak.onrender.com/api/v1/books';

    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern');
    }

    resetForm();
    emit('book-created');
    alert(isEdit ? 'Buch erfolgreich aktualisiert!' : 'Buch erfolgreich gespeichert!');

  } catch (error) {
    console.error(error);
    alert('Es gab einen Fehler beim Verarbeiten!');
  }
};
</script>

<template>
  <div class="form-container">
    <h3>{{ props.bookToEdit ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>
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
          {{ props.bookToEdit ? 'Änderungen speichern' : 'Buch hinzufügen' }}
        </button>
        <button v-if="props.bookToEdit" type="button" @click="emit('cancel-edit')" class="btn-cancel">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-save:hover {
  background-color: #45a049;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-cancel:hover {
  background-color: #da190b;
}
</style>
