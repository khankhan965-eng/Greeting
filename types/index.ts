export interface Product {
  id: number
  name: string
  desc: string
  price: string
  available: boolean
}

// <CHANGE> Added Offer interface for time-based promotions
export interface Offer {
  id: number
  enabled: boolean
  title: string
  description: string
  startTime: string // Format: "09:00 AM"
  endTime: string // Format: "06:00 PM"
}

export interface ShopData {
  shopName: string
  status: "open" | "closed"
  closeMessage: string
  isEarlyClosing?: boolean
  earlyClosingTime?: string
  earlyClosingReason?: string
  // <CHANGE> Added daily auto schedule fields
  enableAutoSchedule?: boolean
  dailyOpenTime?: string // Format: "09:00 AM"
  dailyCloseTime?: string // Format: "10:00 PM"
  // <CHANGE> Added offers array
  offers?: Offer[]
  products: Product[]
}
