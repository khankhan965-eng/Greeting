export interface Product {
  id: number
  name: string
  desc: string
  price: string
  available: boolean
}

export interface Offer {
  id: string
  title: string
  description: string
  active: boolean
  start_datetime: string
  end_datetime: string
  frequency: "always" | "once_per_day" | "first_time"
  show_timer: boolean
  created_at: string
  updated_at: string
}

export interface ShopData {
  shopName: string
  status: "open" | "closed"
  closeMessage: string
  products: Product[]
}
