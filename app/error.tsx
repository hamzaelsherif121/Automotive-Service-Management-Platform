'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100" dir="rtl">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">حصلت مشكلة غير متوقعة!</h1>
                    <p className="text-slate-400 text-lg">
                        بنعتذر جداً، السيستم واجه عطل بسيط. فريقنا هيصلحه في أسرع وقت.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-primary hover:bg-orange-600 gap-2 h-12 text-lg font-bold"
                    >
                        <RefreshCcw className="w-5 h-5" /> المحاولة مرة أخرى
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/5 gap-2 h-12 text-lg"
                        asChild
                    >
                        <Link href="/">
                            <Home className="w-5 h-5" /> الرجوع للرئيسية
                        </Link>
                    </Button>
                </div>

                <div className="pt-8 text-xs text-slate-600 font-mono">
                    Error ID: {error.digest || 'no-digest'}
                </div>
            </div>
        </div>
    )
}
