// AdminRoute - Allows direct access to admin pages without authentication
export default function AdminRoute({ children }) {
  // No authentication check - direct access allowed
  return children
}

// Keep admin email list for potential future use
const ADMIN_EMAILS = [
  "sailendrakondapalli@gmail.com",
  "adduriaswani@gmail.com",
  "susmithajewlaries@gmail.com",
  "info@royalhoof.com",
  "naveenreddygandluri51@gmail.com",
  "aswaniadduri11@gmail.com",
  "ssbmanogna@gmail.com",
  "info@royalhoof.com",
  "ashforkiro@gmail.com",
  "aswaniasshu11@gmail.com",
]

export const isAdmin = (user) => {
  if (!user) return false
  return ADMIN_EMAILS.includes(user.email?.toLowerCase())
}
