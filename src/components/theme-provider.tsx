"use client"

import * as React from "react"

const ThemeContext = React.createContext({
  theme: "dark",
  setTheme: (theme: string) => {},
})

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  forcedTheme?: string
}

function ThemeProvider({ children, attribute = "class", defaultTheme = "system", forcedTheme }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<"light" | "dark">((forcedTheme || defaultTheme) as "light" | "dark")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    const handleThemeChange = () => {
      const root = window.document.documentElement
      const isDark = theme === "dark"

      root.classList.remove(isDark ? "light" : "dark")
      root.classList.add(theme)

      localStorage.setItem("theme", theme)
    }

    handleThemeChange()
  }, [theme, mounted])

  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

function useTheme() {
  return React.useContext(ThemeContext)
}

export { ThemeProvider, useTheme }
