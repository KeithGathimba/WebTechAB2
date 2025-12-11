<script setup lang="ts">
import { ref } from 'vue';

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);

const emit = defineEmits(['book-created']);

const submitForm = async () => {
  const newBook = {
    title: title.value,
    author: author.value,
    releaseYear: releaseYear.value
  };

  try {

    const response = await fetch('https://webtech-backend-g4ak.onrender.com/api/v1/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern');
    }

    title.value = '';
    author.value = '';
    releaseYear.value = 2024;

    emit('book-created');
    alert('Buch erfolgreich gespeichert!');

  } catch (error) {
    console.error(error);
    alert('Es gab einen Fehler beim Speichern!');
  }
};
</script>

<template>
  <div class="form-container">
    <h3>Neues Buch anlegen</h3>
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

      <button type="submit">Buch hinzufügen</button>
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

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
