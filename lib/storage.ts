import type { ShopData } from "@/types"

export const getDefaultData = (): ShopData => ({
  shopName: "RTC (Ratlam Tea Cafe)",
  status: "open",
  closeMessage: "Sorry, RTC is closed at the moment. We'll be back soon!",
  // <CHANGE> Added default daily schedule configuration
  enableAutoSchedule: false,
  dailyOpenTime: "09:00 AM",
  dailyCloseTime: "10:00 PM",
  // <CHANGE> Added default empty offers array
  offers: [],
  products: [
    {
      id: 1,
      name: "Tea",
      desc: "Regular chai",
      price: "10",
      available: true,
    },
    {
      id: 2,
      name: "Special Tea",
      desc: "Special chai",
      price: "20",
      available: true,
    },
    {
      id: 3,
      name: "Coffee",
      desc: "Fresh coffee",
      price: "20",
      available: true,
    },
  ],
})

/**
 * Initialize auth state with passwordHash on first load
 * Initial password is "khan@786" - hashed on first initialization
 * This function is called from admin-login when checking for first-time setup
 */
export const getInitialAuthState = async () => {
  const { hashPassword } = await import("@/lib/auth")
  return {
    passwordHash: await hashPassword("khan@786"),
  }
}
