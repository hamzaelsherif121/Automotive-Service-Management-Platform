"use client"

import Link from "next/link"
import { Phone, MessageCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4 pb-6 safe-area-bottom">
            <div className="grid grid-cols-3 gap-3">
                {/* Call Button */}
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-14 border-white/10 hover:bg-white/5 text-slate-300 gap-1 rounded-xl"
                    asChild
                >
                    <a href="tel:01012978622">
                        <Phone className="h-5 w-5" />
                        <span className="text-[10px font-medium">اتصال</span>
                    </a>
                </Button>

                {/* WhatsApp Button */}
                <Button
                    className="flex flex-col items-center justify-center h-14 bg-[#25D366] hover:bg-[#128C7E] text-white gap-1 rounded-xl shadow-lg shadow-green-900/20"
                    asChild
                >
                    <a href="https://wa.me/201012978622" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-[10px] font-medium">استفسار</span>
                    </a>
                </Button>

                {/* Booking Button */}
                <Button
                    className="flex flex-col items-center justify-center h-14 bg-primary hover:bg-orange-600 text-white gap-1 rounded-xl shadow-lg shadow-orange-900/20"
                    asChild
                >
                    <Link href="/booking">
                        <Calendar className="h-5 w-5" />
                        <span className="text-[10px] font-medium">حجز</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
