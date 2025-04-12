"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, ExternalLink, ChevronDown, Menu, X, Sun, Moon, WalletIcon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { motion } from "framer-motion"

export function Header() {
  const { address, connect, disconnect, isConnecting, isConnected } = useWallet()
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleConnectClick = async () => {
    if (!isConnected) {
      await connect()
    }
  }

  return (
    <header
      className={`border-b border-gray-200 bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}
    >
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">K</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-semibold tracking-tight hidden md:block text-gray-900"
            >
              Klyra
            </motion.h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Products
          </Link>
          <Link href="/portfolio" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Portfolio
          </Link>
          <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 text-gray-900 rounded-full shadow-sm transition-all duration-200"
                >
                  <div className="bg-green-100 w-2 h-2 rounded-full"></div>
                  <span className="hidden md:inline-block font-medium">{shortenAddress(address)}</span>
                  <span className="inline-block md:hidden">Wallet</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white border-gray-200 text-gray-900 rounded-lg shadow-lg p-1 min-w-[200px]"
              >
                <DropdownMenuItem
                  onClick={copyAddress}
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-md transition-all duration-200"
                >
                  <Copy className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`https://etherscan.io/address/${address}`, "_blank")}
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-md transition-all duration-200"
                >
                  <ExternalLink className="mr-2 h-4 w-4 text-gray-500" />
                  <span>View on Explorer</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={disconnect}
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-md transition-all duration-200"
                >
                  <WalletIcon className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleConnectClick}
              disabled={isConnecting}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-t border-gray-200 py-4"
        >
          <div className="container px-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              href="/docs"
              className="text-gray-600 hover:text-gray-900 transition-colors py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  )
}
