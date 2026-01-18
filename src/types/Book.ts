export const BOOK_STATUS = {
  PLANNED: 'Steht an',
  READING: 'Lesend',
  READ: 'Gelesen'
} as const;

export type BookStatusType = typeof BOOK_STATUS[keyof typeof BOOK_STATUS];

export interface Book {
  id: number;
  title: string;
  author: string;
  releaseYear: number;
  status: BookStatusType;
  rating: number;
}
