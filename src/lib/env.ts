export const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY || ""
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Check if required environment variables are set
export function checkEnvVariables() {
  const missingVars = []

  if (!INFURA_API_KEY) missingVars.push("NEXT_PUBLIC_INFURA_API_KEY")
  if (!WALLETCONNECT_PROJECT_ID) missingVars.push("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")

  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}
