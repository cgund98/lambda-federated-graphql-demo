export interface Book {
  id: string
  contents: string
  libraryID: string
}

export const books: Book[] = [
  {
    id: '1',
    contents: 'book one',
    libraryID: '1',
  },
  {
    id: '2',
    contents: 'book two',
    libraryID: '1',
  },
  {
    id: '3',
    contents: 'book three',
    libraryID: '1',
  },
  {
    id: '4',
    contents: 'book four',
    libraryID: '2',
  },
  {
    id: '5',
    contents: 'book five',
    libraryID: '2',
  },
]
