"use client"

import * as React from "react"

// Define the correct type for the context
type ThemeContextType = {
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
}

// Initialize context with a default structure matching the type
const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light", // Default to light or system preference
  setTheme: () => {},
})

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string 
  defaultTheme?: string
  forcedTheme?: string
}

function ThemeProvider({ children, defaultTheme = "system", forcedTheme }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<"dark" | "light">(() => {
    if (forcedTheme) return forcedTheme === "dark" ? "dark" : "light"; // Handle forcedTheme
    if (typeof window === "undefined") {
      return defaultTheme === "dark" ? "dark" : "light"
    }
    const storedTheme = localStorage.getItem("theme")
    // Consider system preference if no stored theme and default is system
    if (!storedTheme && defaultTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return storedTheme === "dark" ? "dark" : "light"
  })

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  // Return the full context again
  return context; 
}

export { ThemeProvider, useTheme }
