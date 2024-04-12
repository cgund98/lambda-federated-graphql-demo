import { Library } from './data'

export interface Context {
  dataSources: {
    libraries: Library[]
  }
}
