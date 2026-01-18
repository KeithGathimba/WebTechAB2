export interface Book {
  id: number;
  title: string;
  author: string;
  releaseYear: number;
  status: string;
  rating: number;
  isbn?: string;
  coverUrl?: string;
}

export const BOOK_STATUS = {
  PLANNED: 'Steht an',
  READING: 'Lesend',
  READ: 'Gelesen'
} as const;
