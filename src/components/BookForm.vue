<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Book } from '../types/Book';

const props = defineProps<{
  bookToEdit: Book | null;
}>();

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);

// Neues Event 'book-deleted' hinzugefügt
const emit = defineEmits(['book-created', 'cancel-edit', 'book-deleted']);

watch(() => props.bookToEdit, (newVal) => {
  if (newVal) {
    title.value = newVal.title;
    author.value = newVal.author;
    releaseYear.value = newVal.releaseYear;
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

  const isEdit = !!props.bookToEdit;
  const url = isEdit
    ? `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit?.id}`
    : 'https://webtech-backend-g4ak.onrender.com/api/v1/books';

  const method = isEdit ? 'PUT' : 'POST';

  try {
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

// Neue Funktion zum Löschen
const deleteBook = async () => {
  if (!props.bookToEdit) return;

  if (!confirm('Möchtest du dieses Buch wirklich löschen?')) {
    return;
  }

  try {
    const response = await fetch(`https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.bookToEdit.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Buch erfolgreich gelöscht!');
      resetForm();
      emit('book-deleted');
    } else {
      alert('Fehler beim Löschen des Buches.');
    }
  } catch (error) {
    console.error("Fehler:", error);
    alert('Netzwerkfehler beim Löschen.');
  }
};
</script>

<template>
  <div class="form-container">
    <h3>{{ props.bookToEdit ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Titel:</label>
        <input id="title" v-model="title" type="text" required placeholder="Titel des Buches" />
      </div>

      <div class="form-group">
        <label for="author">Autor:</label>
        <input id="author" v-model="author" type="text" required placeholder="Name des Autors" />
      </div>

      <div class="form-group">
        <label for="year">Erscheinungsjahr:</label>
        <input id="year" v-model="releaseYear" type="number" required />
      </div>

      <div class="button-group">
        <button type="submit" class="btn-save">
          {{ props.bookToEdit ? 'Speichern' : 'Hinzufügen' }}
        </button>

        <button
          v-if="props.bookToEdit"
          type="button"
          @click="deleteBook"
          class="btn-delete"
        >
          Löschen
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
  background-color: #1e1e1e;
  border: 1px solid #333;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  background-color: #2c2c2c;
  border: 1px solid #444;
  color: #fff;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
  background-color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}

.btn-delete {
  background-color: #c62828;
  color: white;
}

.btn-cancel {
  background-color: #757575;
  color: white;
}
</style>
