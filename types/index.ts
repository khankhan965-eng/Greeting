export interface Product {
  id: number
  name: string
  desc: string
  price: string
  available: boolean
}

export interface ShopData {
  shopName: string
  status: "open" | "closed" // updated code here
  closeMessage: string
  products: Product[]
}
