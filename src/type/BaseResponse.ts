
export interface BaseResponseList<T> {
  products: T[]
  limit: number
  skip: number
  total: number
}