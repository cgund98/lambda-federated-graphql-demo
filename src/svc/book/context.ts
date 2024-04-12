import { Book } from './data'

export interface Context {
  dataSources: {
    books: Book[]
  }
}
