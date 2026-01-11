"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"


export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "الرئيسية", href: "/" },
        { name: "خدماتنا", href: "/services" },
        { name: "قطع غيار", href: "/rare-parts" },
        { name: "عروض 2026", href: "/offers" },
        { name: "تواصل معنا", href: "/contact" },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
            <div className="container mx-auto px-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">

                    <div className="flex flex-col">
                        <span className="text-lg md:text-2xl font-black text-white leading-none tracking-tight group-hover:text-primary transition-colors">
                            HAZEM <span className="text-primary italic">OPEL</span>
                        </span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold group-hover:text-slate-300 transition-colors">
                            Specialist Auto Service
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.href) ? "bg-primary text-white shadow-lg shadow-orange-600/20" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* CTA Button */}
                <div className="hidden md:flex items-center gap-4">
                    <Button className="rounded-full px-6 font-bold bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/5 transition-all hover:scale-105" asChild>
                        <Link href="/booking">
                            احجز معادك <Calendar className="w-4 h-4 mr-2" />
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-white/10 p-4 md:hidden flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`p-3 rounded-lg text-lg font-medium ${isActive(link.href) ? "bg-primary/20 text-primary border border-primary/20" : "text-slate-300 hover:bg-white/5"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Button
                        className="w-full mt-2 font-bold bg-primary hover:bg-orange-600 h-12 text-lg"
                        asChild
                        onClick={() => setIsOpen(false)}
                    >
                        <Link href="/booking">احجز صيانة الآن</Link>
                    </Button>
                </div>
            )}
        </header>
    )
}
