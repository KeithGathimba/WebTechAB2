<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  editData?: any; // Optionales Prop für Bearbeitungsmodus
}>();

const title = ref('');
const author = ref('');
const releaseYear = ref(2024);
const emit = defineEmits(['book-created', 'cancel-edit']);

// Überwacht Änderungen an editData, um das Formular zu füllen
watch(() => props.editData, (newVal) => {
  if (newVal) {
    title.value = newVal.title;
    author.value = newVal.author;
    releaseYear.value = newVal.releaseYear;
  }
}, { immediate: true });

const submitForm = async () => {
  const bookData = {
    title: title.value,
    author: author.value,
    releaseYear: releaseYear.value
  };

  const url = props.editData
    ? `https://webtech-backend-g4ak.onrender.com/api/v1/books/${props.editData.id}`
    : 'https://webtech-backend-g4ak.onrender.com/api/v1/books';

  const method = props.editData ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Fehler beim Speichern');

    // Felder leeren
    title.value = '';
    author.value = '';
    releaseYear.value = 2024;

    emit('book-created');
    alert(props.editData ? 'Buch aktualisiert!' : 'Buch angelegt!');
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="form-container">
    <h3>{{ editData ? 'Buch bearbeiten' : 'Neues Buch anlegen' }}</h3>
    <form @submit.prevent="submitForm">
      <button type="submit">{{ editData ? 'Speichern' : 'Hinzufügen' }}</button>
      <button v-if="editData" type="button" @click="$emit('cancel-edit')">Abbrechen</button>
    </form>
  </div>
</template>
