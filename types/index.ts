export interface Product {
  id: number
  name: string
  desc: string
  price: string
  available: boolean
}

export interface ShopData {
  shopName: string
  status: "open" | "closed"
  closeMessage: string
  isEarlyClosing?: boolean
  earlyClosingTime?: string
  earlyClosingReason?: string
  products: Product[]
}
