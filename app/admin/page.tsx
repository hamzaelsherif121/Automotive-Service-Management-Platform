"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Tag, ShieldAlert, Users, RefreshCcw, Download, Package, Plus, Trash2, Edit2, X, Check, LayoutDashboard, ClipboardList, AlertCircle, FileSpreadsheet, ChevronLeft, ChevronRight, Phone, MessageCircle, ChevronDown, ChevronUp, Ticket, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast, isFuture } from "date-fns"
import { arEG } from "date-fns/locale"
import * as XLSX from "xlsx"

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "parts" | "calendar" | "today" | "leads">("overview")

    // Data
    const [bookings, setBookings] = useState<any[]>([])
    const [leads, setLeads] = useState<any[]>([])
    const [parts, setParts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isSoundEnabled, setIsSoundEnabled] = useState(true)

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
    const [editingBooking, setEditingBooking] = useState<any>(null) // For editing date/time
    const [newDate, setNewDate] = useState<Date | undefined>(undefined)
    const [newTime, setNewTime] = useState<string>("")

    // Booking Filters
    const [filterPhone, setFilterPhone] = useState<string>("")
    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterTicketId, setFilterTicketId] = useState<string>("")
    const [filterDateFrom, setFilterDateFrom] = useState<string>("")
    const [filterDateTo, setFilterDateTo] = useState<string>("")
    const [filterTimeSlot, setFilterTimeSlot] = useState<string>("")

    // Add Part Form
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newPart, setNewPart] = useState({
        name: "",
        models: "",
        year: "",
        status: "available",
        symptoms: ""
    })

    const fetchData = async (isSilent = false) => {
        if (!isSilent) setLoading(true)
        try {
            // Fetch Bookings
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })

            // Fetch Leads
            const { data: leadsData } = await supabase
                .from('offer_leads')
                .select('*')
                .order('created_at', { ascending: false })

            // Fetch Parts
            const { data: partsData } = await supabase
                .from('rare_parts')
                .select('*')
                .order('created_at', { ascending: false })

            if (bookingsData) setBookings(bookingsData)
            if (leadsData) setLeads(leadsData)
            if (partsData) setParts(partsData)

        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }
        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            // Track known booking IDs
            let knownBookingIds = new Set<string>()
            let isFirstLoad = true

            const checkForNewBookings = async () => {
                try {
                    const { data: bookingsData } = await supabase
                        .from('bookings')
                        .select('*')
                        .order('created_at', { ascending: false })

                    const { data: leadsData } = await supabase
                        .from('offer_leads')
                        .select('*')
                        .order('created_at', { ascending: false })

                    const { data: partsData } = await supabase
                        .from('rare_parts')
                        .select('*')
                        .order('created_at', { ascending: false })

                    if (bookingsData) {
                        // Check for new bookings
                        if (!isFirstLoad) {
                            const newBookings = bookingsData.filter(b => !knownBookingIds.has(b.id))
                            if (newBookings.length > 0) {
                                // 1. Attempt to play sound IMMEDIATELY
                                if (audioRef.current) {
                                    audioRef.current.currentTime = 0
                                    audioRef.current.play().catch(err => {
                                        console.error("Audio play failed:", err)
                                        setIsSoundEnabled(false)
                                    })
                                }

                                // 2. Show toast after a tiny delay to ensure audio thread starts
                                setTimeout(() => {
                                    const latestNew = newBookings[0]
                                    toast.info(`حجز جديد من ${latestNew.name}`, {
                                        description: latestNew.car_model,
                                        duration: 10000,
                                    })
                                }, 50)
                            }
                        }

                        // Update known IDs
                        knownBookingIds = new Set(bookingsData.map(b => b.id))
                        isFirstLoad = false
                        setBookings(bookingsData)
                    }
                    if (leadsData) setLeads(leadsData)
                    if (partsData) setParts(partsData)
                } catch (error) {
                    console.error("Error fetching data:", error)
                }
            }

            // Initial fetch
            checkForNewBookings()

            // Poll every 2 seconds
            const interval = setInterval(checkForNewBookings, 2000)

            return () => {
                clearInterval(interval)
            }
        }
    }, [isAuthenticated])

    useEffect(() => {
        // Initialize audio object
        const audio = new Audio("/notification.mp3")
        audio.load()
        audioRef.current = audio
    }, [])

    // Automatically unlock audio context on first user interaction
    useEffect(() => {
        const unlockAudio = () => {
            if (audioRef.current && !isSoundEnabled) {
                // Play a brief moment and immediately pause/seek to start
                // this "primes" the audio context for future automated play
                audioRef.current.play()
                    .then(() => {
                        setIsSoundEnabled(true)
                        audioRef.current!.pause()
                        audioRef.current!.currentTime = 0
                        // Cleanup listeners once unlocked
                        window.removeEventListener('click', unlockAudio)
                        window.removeEventListener('touchstart', unlockAudio)
                    })
                    .catch(err => {
                        console.log("Auto-unlock pending interaction:", err)
                    })
            }
        }

        window.addEventListener('click', unlockAudio)
        window.addEventListener('touchstart', unlockAudio)

        return () => {
            window.removeEventListener('click', unlockAudio)
            window.removeEventListener('touchstart', unlockAudio)
        }
    }, [isSoundEnabled])

    const testSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
                .then(() => {
                    setIsSoundEnabled(true)
                    toast.success("الصوت يعمل بشكل صحيح")
                })
                .catch(err => {
                    console.error("Manual audio play failed:", err)
                    toast.error("فشل تشغيل الصوت. يرجى التأكد من إذن المتصفح")
                })
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert(`خطأ في تسجيل الدخول: ${error.message}`)
        }
        setLoading(false)
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await supabase.auth.signOut()
        } finally {
            setLoading(false)
        }
    }

    // Reservation Management
    const updateBookingStatus = async (id: string, status: string) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id)

            if (error) throw error
            toast.success("تم تحديث الحالة بنجاح")
            fetchData()
        } catch (error) {
            console.error('Error updating booking:', error)
            toast.error("حدث خطأ أثناء التحديث")
        } finally {
            setLoading(false)
        }
    }

    const updateBookingDate = async () => {
        if (!editingBooking || !newDate) return
        setLoading(true)
        try {
            // Update Date ID
            const updates: any = { date: newDate.toISOString() }

            if (newTime && editingBooking.service_type) {
                const timeRegex = /(⏰\s)([^|]+)/;
                if (timeRegex.test(editingBooking.service_type)) {
                    updates.service_type = editingBooking.service_type.replace(timeRegex, `$1${newTime} `);
                } else {
                    updates.service_type = editingBooking.service_type + ` | ⏰ ${newTime}`;
                }
            }

            if (editingBooking.status === 'missed' || editingBooking.status === 'cancelled') {
                updates.status = 'confirmed';
            }

            const { error } = await supabase
                .from('bookings')
                .update(updates)
                .eq('id', editingBooking.id)

            if (error) throw error
            toast.success("تم تعديل المعاد بنجاح")
            setEditingBooking(null)
            fetchData()
        } catch (error) {
            console.error('Error updating booking date:', error)
            toast.error("حدث خطأ أثناء تعديل المعاد")
        } finally {
            setLoading(false)
        }
    }

    const deleteBooking = async (id: string) => {
        if (!confirm("تأكيد حذف الحجز نهائياً؟")) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id)

            if (error) {
                toast.error("فشل الحذف")
            } else {
                toast.success("تم الحذف بنجاح")
                fetchData()
            }
        } finally {
            setLoading(false)
        }
    }

    const exportAllDataToExcel = () => {
        if (bookings.length === 0 && leads.length === 0 && parts.length === 0) {
            toast.error("مفيش بيانات للتصدير")
            return
        }

        const wb = XLSX.utils.book_new()

        // Helper to auto-size columns
        const autoSize = (data: any[][]) => {
            if (!data || data.length === 0) return [];
            const maxCols = data[0].length;
            return Array.from({ length: maxCols }, (_, i) => ({
                wch: Math.max(...data.map(row => row[i] ? row[i].toString().length : 0), 10) + 5
            }));
        }

        // 1. Stats Sheet
        const statsData = [
            ["تقرير حازم أوبل - Hazem Opel Report"],
            ["----------------------------------"],
            ["الإحصائيات العامة", ""],
            ["إجمالي العملاء", new Set([...bookings.map(b => b.phone), ...leads.map(l => l.phone)]).size],
            ["إجمالي الحجوزات", bookings.length],
            ["حجوزات النهاردة", bookings.filter(b => isToday(new Date(b.date))).length],
            ["طلبات العروض", leads.length],
            ["قطع الغيار في المخزن", parts.length],
            [""],
            ["تاريخ التصدير", new Date().toLocaleString('ar-EG')]
        ]
        const wsStats = XLSX.utils.aoa_to_sheet(statsData)
        wsStats['!dir'] = 'rtl'
        wsStats['!cols'] = [{ wch: 30 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(wb, wsStats, "نظرة عامة")

        // 2. Bookings Sheet
        const bookingsHeaders = ["الاسم", "الموبايل", "تاريخ الحجز", "السيارة", "الخدمة", "الحالة", "تاريخ الطلب"]
        const bookingsRows = bookings.map(b => [
            b.name,
            b.phone,
            new Date(b.date).toLocaleDateString('ar-EG'),
            b.car_model,
            b.service_type,
            b.status,
            new Date(b.created_at).toLocaleString('ar-EG')
        ])
        const wsBookings = XLSX.utils.aoa_to_sheet([bookingsHeaders, ...bookingsRows])
        wsBookings['!dir'] = 'rtl'
        wsBookings['!cols'] = autoSize([bookingsHeaders, ...bookingsRows])
        XLSX.utils.book_append_sheet(wb, wsBookings, "الحجوزات")

        // 3. Inventory Sheet
        const partsHeaders = ["القطعة", "الموديلات", "السنة", "الحالة", "الأعراض"]
        const partsRows = parts.map(p => [
            p.name,
            Array.isArray(p.models) ? p.models.join(", ") : p.models,
            p.year,
            p.status === "available" ? "متوفر" : "غير متوفر",
            Array.isArray(p.symptoms) ? p.symptoms.join(", ") : p.symptoms
        ])
        const wsParts = XLSX.utils.aoa_to_sheet([partsHeaders, ...partsRows])
        wsParts['!dir'] = 'rtl'
        wsParts['!cols'] = autoSize([partsHeaders, ...partsRows])
        XLSX.utils.book_append_sheet(wb, wsParts, "المخزون")

        // 4. Offer Leads Sheet
        const leadsHeaders = ["الاسم", "الموبايل", "العرض", "تاريخ الطلب"]
        const leadsRows = leads.map(l => [
            l.name || "بدون اسم",
            l.phone,
            l.offer_title,
            new Date(l.created_at).toLocaleString('ar-EG')
        ])
        const wsLeads = XLSX.utils.aoa_to_sheet([leadsHeaders, ...leadsRows])
        wsLeads['!dir'] = 'rtl'
        wsLeads['!cols'] = autoSize([leadsHeaders, ...leadsRows])
        XLSX.utils.book_append_sheet(wb, wsLeads, "طلبات العروض")

        // Export File
        XLSX.writeFile(wb, `HazemOpel_Data_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success("تم تصدير البيانات بنجاح")
    }

    // Parts Management Functions (unchanged logic)
    const handleSavePart = async () => {
        if (!newPart.name || !newPart.models) {
            toast.error("الرجاء إدخال اسم القطعة والموديل على الأقل")
            return
        }

        setLoading(true)
        try {
            const modelsArray = newPart.models.split(",").map(m => m.trim())
            const symptomsArray = newPart.symptoms ? newPart.symptoms.split(",").map(s => s.trim()) : []

            const partData = {
                name: newPart.name,
                models: modelsArray,
                year: newPart.year || "غير محدد",
                status: newPart.status,
                symptoms: symptomsArray
            }

            if (editingId) {
                const { error } = await supabase
                    .from('rare_parts')
                    .update(partData)
                    .eq('id', editingId)

                if (error) {
                    toast.error(`خطأ في التعديل: ${error.message}`)
                } else {
                    toast.success("تم تعديل القطعة بنجاح")
                    resetForm()
                    fetchData()
                }
            } else {
                const { error } = await supabase.from('rare_parts').insert([partData])

                if (error) {
                    toast.error(`حصل خطأ أثناء الإضافة: ${error.message}`)
                } else {
                    toast.success("تم إضافة القطعة بنجاح")
                    resetForm()
                    fetchData()
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const startEditing = (part: any) => {
        setNewPart({
            name: part.name,
            models: part.models ? part.models.join(", ") : "",
            year: part.year || "",
            status: part.status || "available",
            symptoms: part.symptoms ? part.symptoms.join(", ") : ""
        })
        setEditingId(part.id)
        setShowAddForm(true)
    }

    const resetForm = () => {
        setNewPart({ name: "", models: "", year: "", status: "available", symptoms: "" })
        setEditingId(null)
        setShowAddForm(false)
    }

    const deletePart = async (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذه القطعة؟")) {
            setLoading(true)
            try {
                const { error } = await supabase.from('rare_parts').delete().eq('id', id)
                if (!error) {
                    toast.success("تم حذف القطعة")
                    fetchData()
                } else {
                    toast.error("فشل حذف القطعة")
                }
            } finally {
                setLoading(false)
            }
        }
    }

    const togglePartStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === "available" ? "unavailable" : "available"
        setLoading(true)
        try {
            const { error } = await supabase.from('rare_parts').update({ status: newStatus }).eq('id', id)
            if (!error) fetchData()
        } finally {
            setLoading(false)
        }
    }


    // Calendar Helpers
    const getCalendarDays = () => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 6 }) // Saturday start
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 6 })
        return eachDayOfInterval({ start, end })
    }

    const handleTestTelegram = async () => {
        try {
            const res = await fetch('/api/admin/test-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "🔔 <b>اختبار إشعارات تليجرام!</b>\n\nإذا وصلتك هذه الرسالة، فهذا يعني أن الربط يعمل بشكل صحيح." })
            })
            const data = await res.json()
            if (data.success) {
                toast.success("تم إرسال رسالة الاختبار بنجاح!")
            } else {
                toast.error(`خطأ: ${data.error}`)
            }
        } catch (error) {
            toast.error("فشل الاتصال بالخادم")
        }
    }

    const sortBookingsByTime = (a: any, b: any) => {
        const extractTimeValue = (serviceType: string) => {
            const timeMatch = serviceType?.match(/⏰\s(\d+):(\d+)/);
            if (!timeMatch) return 9999;

            let hour = parseInt(timeMatch[1]);
            const minute = parseInt(timeMatch[2]);
            const isPM = serviceType.includes('م');

            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;

            return hour * 60 + minute;
        };
        return extractTimeValue(a.service_type) - extractTimeValue(b.service_type);
    }

    const getBookingsForDay = (date: Date) => {
        return bookings
            .filter(b => isSameDay(new Date(b.date), date) && b.status === "confirmed")
            .sort(sortBookingsByTime)
    }

    // Derived Lists
    const todayBookings = bookings
        .filter(b => isToday(new Date(b.date)) && b.status === "confirmed")
        .sort(sortBookingsByTime)
    const missedBookings = bookings.filter(b =>
        isPast(new Date(b.date)) &&
        !isToday(new Date(b.date)) &&
        b.status === "confirmed"
    )
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-center text-white flex justify-center gap-2 items-center">
                            <ShieldAlert className="text-primary" /> لوحة المشرف
                        </CardTitle>
                        <CardDescription className="text-center text-slate-400">سجل دخول لمتابعة الحجوزات والعروض</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white">البريد الإلكتروني</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">كلمة المرور</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                    required
                                />
                            </div>
                            <Button className="w-full bg-primary hover:bg-orange-600 font-bold" disabled={loading}>
                                {loading ? "جاري التحميل..." : "دخول النظام"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-32" dir="rtl">
            <div className="container mx-auto max-w-7xl">
                <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6 lg:sticky lg:top-32">
                            <h2 className="text-xl font-bold text-white mb-6">التحكم</h2>

                            <nav className="space-y-2 mb-8">
                                <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "overview" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="font-medium">نظرة عامة</span>
                                </button>
                                <button onClick={() => setActiveTab("today")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "today" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <Check className="w-5 h-5" />
                                    <span className="font-medium">شغل النهاردة</span>
                                    {todayBookings.length > 0 && <Badge className="mr-auto bg-green-500 text-white">{todayBookings.length}</Badge>}
                                </button>
                                <button onClick={() => setActiveTab("bookings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "bookings" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <ClipboardList className="w-5 h-5" />
                                    <span className="font-medium">كل الحجوزات</span>
                                    {pendingBookingsCount > 0 && <Badge className="mr-auto bg-orange-500 text-white">{pendingBookingsCount}</Badge>}
                                </button>
                                <button onClick={() => setActiveTab("calendar")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "calendar" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <CalendarIcon className="w-5 h-5" />
                                    <span className="font-medium">الجدول الشهري</span>
                                </button>
                                <button onClick={() => setActiveTab("parts")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "parts" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <Package className="w-5 h-5" />
                                    <span className="font-medium">المخزون</span>
                                </button>
                                <button onClick={() => setActiveTab("leads")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${activeTab === "leads" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                                    <Tag className="w-5 h-5" />
                                    <span className="font-medium">طلبات العروض</span>
                                </button>
                            </nav>

                            {/* Export Button */}
                            <Button variant="outline" onClick={exportAllDataToExcel} className="w-full gap-2 border-green-500/30 text-green-500 hover:bg-green-500/10 mb-2">
                                <FileSpreadsheet className="w-4 h-4" />
                                تصدير البيانات Excel
                            </Button>

                            <Button variant="ghost" onClick={() => fetchData()} disabled={loading} className="w-full gap-2 text-slate-400 hover:bg-white/5">
                                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                تحديث البيانات
                            </Button>
                            <Button variant="ghost" onClick={handleTestTelegram} className="w-full gap-2 text-blue-400 hover:bg-blue-500/10">
                                <Send className="w-4 h-4" />
                                تجربة التليجرام
                            </Button>
                            <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 mt-2 text-red-400 hover:bg-red-500/10">
                                <X className="w-4 h-4" />
                                تسجيل الخروج
                            </Button>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <Button
                                    variant="outline"
                                    onClick={testSound}
                                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    اختبار صوت الإشعارات
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">

                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center shadow-lg shadow-black/20">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-slate-400 text-sm mb-1">إجمالي العملاء</p>
                                        <h3 className="text-3xl font-bold text-white">
                                            {new Set([...bookings.map(b => b.phone), ...leads.map(l => l.phone)]).size}
                                        </h3>
                                    </div>
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("today")}>
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CalendarIcon className="w-6 h-6 text-green-500" />
                                        </div>
                                        <p className="text-slate-400 text-sm mb-1">حجوزات النهاردة</p>
                                        <h3 className="text-3xl font-bold text-white">{todayBookings.length}</h3>
                                    </div>
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <Tag className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <p className="text-slate-400 text-sm mb-1">طلبات العروض</p>
                                        <h3 className="text-3xl font-bold text-white">{leads.length}</h3>
                                    </div>
                                </div>



                                {/* Missed Reservations Alert */}
                                {missedBookings.length > 0 && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                                        <h3 className="text-red-500 font-bold text-xl mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-6 h-6" /> حجوزات فائتة ({missedBookings.length})
                                        </h3>
                                        <p className="text-slate-400 mb-4">حجوزات كانت مؤكدة ومعادها فات بس لسه متعملهاش "مكتمل". يرجى المتابعة مع العملاء.</p>
                                        <div className="space-y-2">
                                            {missedBookings.map(booking => (
                                                <div key={booking.id} className="bg-slate-900/50 p-3 rounded-xl flex justify-between items-center gap-3 border border-red-500/10">
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-white font-bold block truncate">{booking.name}</span>
                                                        <span className="text-slate-500 text-sm block">{new Date(booking.date).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-400" asChild>
                                                            <a href={`https://wa.me/20${booking.phone.substring(1)}`} target="_blank">
                                                                <MessageCircle className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => updateBookingStatus(booking.id, "cancelled")}>
                                                            إلغاء
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Today's Work Section (Replacing Chart) */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Check className="text-green-500 w-5 h-5" /> شغل النهاردة
                                            <span className="text-sm font-normal text-slate-500 mr-2">{format(new Date(), 'EEEE d MMMM', { locale: arEG })}</span>
                                        </h3>
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                            {todayBookings.length} حجز مؤكد
                                        </Badge>
                                    </div>

                                    {todayBookings.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-white/5">
                                            <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarIcon className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">مفيش مواعيد النهاردة</h3>
                                            <p className="text-sm text-slate-500">استمتع بوقتك أو راجع جدول بكرة.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {todayBookings.map(booking => (
                                                <div key={booking.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
                                                    <div className="absolute top-0 right-0 w-1 h-full bg-green-500/40 group-hover:bg-green-500 transition-colors" />

                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white mb-0.5">{booking.name}</h3>
                                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                                <Phone className="w-3 h-3" />
                                                                <span className="font-mono">{booking.phone}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-950 px-3 py-1 rounded-lg border border-white/10">
                                                            <span className="text-primary font-bold text-sm">
                                                                {(() => {
                                                                    const timeMatch = booking.service_type?.match(/⏰\s([^|]+)/);
                                                                    return timeMatch ? timeMatch[1].trim() : '—';
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                                                            <Label className="text-[10px] text-slate-500 block mb-1">السيارة</Label>
                                                            <p className="text-slate-300 text-xs font-medium truncate">{booking.car_model}</p>
                                                        </div>
                                                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                                                            <Label className="text-[10px] text-slate-500 block mb-1">نوع الخدمة</Label>
                                                            <p className="text-slate-300 text-xs font-medium truncate">
                                                                {booking.service_type?.split('|')[0].trim() || "صيانة"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-xs font-bold gap-1.5"
                                                            onClick={() => updateBookingStatus(booking.id, "completed")}
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> تم
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-9 text-xs border-green-500/20 text-green-500 hover:bg-green-500/10 px-3"
                                                            asChild
                                                        >
                                                            <a href={`https://wa.me/20${booking.phone?.startsWith('0') ? booking.phone.substring(1) : booking.phone}`} target="_blank">
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 h-9 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10"
                                                            onClick={() => updateBookingStatus(booking.id, "missed")}
                                                        >
                                                            مجاش
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Leads Tab Content */}
                        {activeTab === "leads" && (
                            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">سجل طلبات العروض</h2>
                                    <Badge className="bg-orange-500/20 text-orange-500">{leads.length} طلب</Badge>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {leads.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">مفيش طلبات عروض لسه</div>
                                    ) : (
                                        leads.map((lead: any) => (
                                            <div key={lead.id} className="p-4 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-white">{lead.name || "بدون اسم"}</span>
                                                        <span className="text-slate-500 text-sm font-mono">{lead.phone}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {new Date(lead.created_at).toLocaleDateString('ar-EG')} | {lead.offer_title}
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="text-green-500 hover:bg-green-500/10" asChild>
                                                    <a href={`https://wa.me/20${lead.phone.substring(1)}`} target="_blank">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Calendar Tab */}
                        {activeTab === "calendar" && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">جدول الحجوزات</h2>
                                    <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-white/10">
                                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                        <span className="text-lg font-bold min-w-[120px] text-center">
                                            {format(currentMonth, 'MMMM yyyy', { locale: arEG })}
                                        </span>
                                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="w-full">
                                    {/* Large Calendar Grid */}
                                    <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-2 md:p-6">
                                        <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-lg overflow-hidden border border-slate-800">
                                            {/* Header Days */}
                                            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
                                                <div key={day} className="bg-slate-950 p-2 md:p-3 text-center text-[10px] md:text-sm font-medium text-slate-400">
                                                    <span className="hidden md:inline">{day}</span>
                                                    <span className="md:hidden">{day.charAt(0)}</span>
                                                </div>
                                            ))}

                                            {/* Days */}
                                            {getCalendarDays().map((date, i) => {
                                                const dayBookings = getBookingsForDay(date)
                                                const isSelected = selectedDate && isSameDay(date, selectedDate)
                                                const isCurrentMonth = isSameMonth(date, currentMonth)

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`min-h-[70px] md:min-h-[120px] bg-slate-900 p-1 md:p-2 hover:bg-slate-800/80 transition-colors cursor-pointer relative group border border-white/5 rounded-lg md:rounded-xl ${!isCurrentMonth ? 'opacity-30' : ''
                                                            } ${isSelected ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
                                                        onClick={() => setSelectedDate(date)}
                                                    >
                                                        <span className={`text-sm md:text-lg font-bold block mb-1 md:mb-2 ${isToday(date) ? 'text-primary' : 'text-slate-400'}`}>
                                                            {format(date, 'd')}
                                                        </span>

                                                        {dayBookings.length > 0 && (
                                                            <div className="absolute inset-x-0 bottom-2 md:bottom-4 flex justify-center">
                                                                <span className="text-xs md:text-xl font-bold text-white bg-primary/20 rounded-full w-5 h-5 md:w-8 md:h-8 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                                                    {dayBookings.length}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                        {/* Calendar Details Modal */}
                        {selectedDate && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                                    {/* Modal Header */}
                                    <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                                        <div>
                                            <h3 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                                                <CalendarIcon className="text-primary w-5 h-5 md:w-6 md:h-6" />
                                                {format(selectedDate, 'EEEE d MMMM', { locale: arEG })}
                                            </h3>
                                            <p className="text-xs md:text-slate-400 mt-1">
                                                {bookings.filter(b => isSameDay(new Date(b.date), selectedDate)).length} حجوزات في هذا اليوم
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="rounded-full hover:bg-white/10">
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                        {bookings.filter(b => isSameDay(new Date(b.date), selectedDate)).length === 0 ? (
                                            <div className="text-center py-12 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                    <CalendarIcon className="w-8 h-8 text-slate-500" />
                                                </div>
                                                <p className="text-slate-400 text-lg">مفيش حجوزات في اليوم ده</p>
                                                <Button variant="ghost" className="mt-4 text-primary" onClick={() => setSelectedDate(null)}>
                                                    العودة للجدول
                                                </Button>
                                            </div>
                                        ) : (
                                            bookings
                                                .filter(b => isSameDay(new Date(b.date), selectedDate))
                                                .map(booking => {
                                                    const isExpanded = expandedBookingId === booking.id;
                                                    return (
                                                        <div
                                                            key={booking.id}
                                                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded
                                                                ? 'bg-slate-800/50 border-primary/30 shadow-lg shadow-black/20'
                                                                : 'bg-slate-950/50 border-white/5 hover:border-white/10'
                                                                }`}
                                                        >
                                                            {/* Summary Row */}
                                                            <div
                                                                className="p-4 flex items-center justify-between cursor-pointer"
                                                                onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${booking.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'
                                                                        }`}>
                                                                        {booking.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-white text-lg">{booking.name}</h4>
                                                                        <p className="text-slate-400 font-mono text-sm" dir="ltr">{booking.phone}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={`${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                                        booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                                                            'bg-slate-700 text-slate-300'
                                                                        }`}>
                                                                        {booking.status === 'confirmed' ? 'مؤكد' : booking.status}
                                                                    </Badge>
                                                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                                                </div>
                                                            </div>

                                                            {/* Expanded Details */}
                                                            {isExpanded && (
                                                                <div className="border-t border-white/5 bg-slate-900/50 p-6 animate-in slide-in-from-top-2">
                                                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                                        <div>
                                                                            <Label className="text-slate-500 text-xs mb-1 block">تفاصيل السيارة</Label>
                                                                            <div className="text-white font-medium flex items-center gap-2">
                                                                                <Tag className="w-4 h-4 text-primary" />
                                                                                {booking.car_model}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-slate-500 text-xs mb-1 block">رقم التذكرة (Booking ID)</Label>
                                                                            <div className="text-white font-mono flex items-center gap-2">
                                                                                <Ticket className="w-4 h-4 text-orange-500" />
                                                                                #{booking.id?.slice(0, 8).toUpperCase()}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                                                                        <Label className="text-slate-500 text-xs mb-2 block">الخدمات المطلوبة</Label>
                                                                        <div className="text-white leading-relaxed">
                                                                            {booking.service_type || "لا توجد تفاصيل إضافية"}
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="flex gap-3 pt-2 border-t border-white/5">
                                                                        {booking.status === 'confirmed' && (
                                                                            <Button
                                                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                                                                                disabled={isFuture(new Date(booking.date)) && !isToday(new Date(booking.date))}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateBookingStatus(booking.id, "completed");
                                                                                }}
                                                                            >
                                                                                <Check className="w-4 h-4 ml-2" /> إتمام الخدمة
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            variant="outline"
                                                                            className="flex-1 border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingBooking(booking);
                                                                                setNewDate(new Date(booking.date));
                                                                                // Extract current time to set default
                                                                                const timeMatch = booking.service_type?.match(/⏰\s([^|]+)/);
                                                                                if (timeMatch) setNewTime(timeMatch[1].trim());
                                                                            }}
                                                                        >
                                                                            <Edit2 className="w-4 h-4 ml-2" /> تعديل المعاد
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteBooking(booking.id);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-4 h-4 ml-2" /> إلغاء
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-white/10 bg-slate-900/50 text-center">
                                        <Button variant="ghost" className="text-slate-500 hover:text-white" onClick={() => setSelectedDate(null)}>
                                            إغلاق النافذة
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Today's Stats Tab */}
                        {activeTab === "today" && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Check className="text-green-500" /> شغل النهاردة ({format(new Date(), 'EEEE d MMMM', { locale: arEG })})
                                </h2>

                                {todayBookings.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-900 rounded-2xl border border-white/5">
                                        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CalendarIcon className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">مفيش مواعيد النهاردة</h3>
                                        <p className="text-slate-400">استمتع بوقتك أو راجع جدول بكرة.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {todayBookings.map(booking => (
                                            <div key={booking.id} className="bg-slate-900 border border-green-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-1 h-full bg-green-500" />
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white mb-1">{booking.name}</h3>
                                                        <p className="text-slate-400 font-mono">{booking.phone}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block text-xl font-bold text-white">
                                                            {(() => {
                                                                const timeMatch = booking.service_type?.match(/⏰\s([^|]+)/);
                                                                return timeMatch ? timeMatch[1].trim() : '—';
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-950/50 p-4 rounded-xl mb-6 border border-white/5">
                                                    <p className="text-slate-300 text-sm mb-1"><span className="text-slate-500">العربية:</span> {booking.car_model}</p>
                                                    <p className="text-slate-300 text-sm"><span className="text-slate-500">الشغل:</span> {booking.service_type}</p>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button className="flex-1 bg-green-600 hover:bg-green-700 font-bold" onClick={() => updateBookingStatus(booking.id, "completed")}>
                                                        <Check className="w-4 h-4 ml-2" /> تم الانتهاء
                                                    </Button>
                                                    <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => updateBookingStatus(booking.id, "missed")}>
                                                        مجاش
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* All Bookings Table (Simplified from before, just adding delete/manage actions) */}
                        {activeTab === "bookings" && (
                            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold text-white mb-4">سجل الحجوزات الكامل</h2>
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">بحث برقم الموبايل</Label>
                                            <Input
                                                placeholder="01012345678"
                                                value={filterPhone}
                                                onChange={(e) => setFilterPhone(e.target.value)}
                                                className="bg-slate-950 border-white/10 text-white h-9"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">بحث برقم التذكرة</Label>
                                            <Input
                                                placeholder="72B43A30"
                                                value={filterTicketId}
                                                onChange={(e) => setFilterTicketId(e.target.value.toUpperCase())}
                                                className="bg-slate-950 border-white/10 text-white h-9 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">فلتر بالحالة</Label>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-full h-9 bg-slate-950 border border-white/10 rounded-md px-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                <option value="">كل الحالات</option>
                                                <option value="pending">قيد الانتظار</option>
                                                <option value="confirmed">مؤكد</option>
                                                <option value="completed">مكتمل</option>
                                                <option value="missed">فائت</option>
                                                <option value="cancelled">ملغي</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Row 2: Date and Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">من تاريخ</Label>
                                            <Input
                                                type="date"
                                                value={filterDateFrom}
                                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                                className="bg-slate-950 border-white/10 text-white h-9 cursor-pointer"
                                                onClick={(e) => e.currentTarget.showPicker()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">إلى تاريخ</Label>
                                            <Input
                                                type="date"
                                                value={filterDateTo}
                                                onChange={(e) => setFilterDateTo(e.target.value)}
                                                className="bg-slate-950 border-white/10 text-white h-9 cursor-pointer"
                                                onClick={(e) => e.currentTarget.showPicker()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-500 text-xs mb-1 block">فترة الحضور</Label>
                                            <select
                                                value={filterTimeSlot}
                                                onChange={(e) => setFilterTimeSlot(e.target.value)}
                                                className="w-full h-9 bg-slate-950 border border-white/10 rounded-md px-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                <option value="">كل الفترات</option>
                                                <option value="9:00 - 11:00 ص">9:00 - 11:00 ص</option>
                                                <option value="11:00 - 1:00 م">11:00 - 1:00 م</option>
                                                <option value="1:00 - 3:00 م">1:00 - 3:00 م</option>
                                                <option value="3:00 - 5:00 م">3:00 - 5:00 م</option>
                                                <option value="5:00 - 7:00 م">5:00 - 7:00 م</option>
                                                <option value="7:00 - 9:00 م">7:00 - 9:00 م</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {bookings
                                        .filter((booking: any) => {
                                            // Filter by phone
                                            if (filterPhone && !booking.phone?.includes(filterPhone)) return false;
                                            // Filter by status
                                            if (filterStatus && booking.status !== filterStatus) return false;
                                            // Filter by ticket ID (first 8 chars)
                                            if (filterTicketId && !booking.id?.slice(0, 8).toUpperCase().includes(filterTicketId)) return false;
                                            // Filter by date range
                                            if (filterDateFrom) {
                                                const bookingDate = new Date(booking.date).toISOString().split('T')[0];
                                                if (bookingDate < filterDateFrom) return false;
                                            }
                                            if (filterDateTo) {
                                                const bookingDate = new Date(booking.date).toISOString().split('T')[0];
                                                if (bookingDate > filterDateTo) return false;
                                            }
                                            // Filter by time slot (embedded in service_type)
                                            if (filterTimeSlot && !booking.service_type?.includes(filterTimeSlot)) return false;
                                            return true;
                                        })
                                        .map((booking: any) => {
                                            const isExpanded = expandedBookingId === booking.id;
                                            return (
                                                <div key={booking.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                                    {/* Header Row */}
                                                    <div
                                                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                                                        onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${booking.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'
                                                                }`}>
                                                                {booking.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="font-bold text-white text-lg">{booking.name}</h4>
                                                                    <Badge className={`${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                                        booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                                                            booking.status === 'missed' ? 'bg-red-500/20 text-red-500' :
                                                                                'bg-slate-700 text-slate-300'
                                                                        }`}>
                                                                        {booking.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                                                    <span className="font-mono">{booking.phone}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(booking.date).toLocaleDateString('ar-EG')}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                                            {booking.status === 'pending' && (
                                                                <Button size="sm" variant="outline" className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10" onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    updateBookingStatus(booking.id, "confirmed")
                                                                }}>تأكيد</Button>
                                                            )}
                                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    {isExpanded && (
                                                        <div className="px-6 pb-6 pt-2 bg-slate-900/50 animate-in slide-in-from-top-2">
                                                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                                <div>
                                                                    <Label className="text-slate-500 text-xs mb-1 block">رقم التذكرة</Label>
                                                                    <div className="text-white font-mono flex items-center gap-2">
                                                                        <Ticket className="w-4 h-4 text-orange-500" />
                                                                        #{booking.id?.slice(0, 8).toUpperCase()}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-slate-500 text-xs mb-1 block">السيارة</Label>
                                                                    <div className="text-white font-medium flex items-center gap-2">
                                                                        <Tag className="w-4 h-4 text-primary" />
                                                                        {booking.car_model} {booking.year ? `(${booking.year})` : ''}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
                                                                <Label className="text-slate-500 text-xs mb-2 block">الخدمات المطلوبة</Label>
                                                                <div className="text-white leading-relaxed">
                                                                    {booking.service_type || "لا توجد تفاصيل إضافية"}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                                                                    asChild
                                                                >
                                                                    <a href={`https://wa.me/20${booking.phone?.startsWith('0') ? booking.phone.substring(1) : booking.phone}`} target="_blank">
                                                                        <MessageCircle className="w-4 h-4 ml-2" /> واتساب
                                                                    </a>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingBooking(booking);
                                                                        setNewDate(new Date(booking.date));
                                                                        // Extract current time to set default
                                                                        const timeMatch = booking.service_type?.match(/⏰\s([^|]+)/);
                                                                        if (timeMatch) setNewTime(timeMatch[1].trim());
                                                                    }}
                                                                >
                                                                    <Edit2 className="w-4 h-4 ml-2" /> تعديل
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteBooking(booking.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4 ml-2" /> حذف
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Parts Tab Content (Already implemented) */}
                        {activeTab === "parts" && (
                            /* ... Existing Parts Logic ... */
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Package className="text-primary" /> إدارة قطع الغيار
                                        </h2>
                                        <p className="text-slate-400 mt-1">إضافة، تعديل، أو حذف قطع الغيار من القائمة</p>
                                    </div>
                                    <Button onClick={() => { resetForm(); setShowAddForm(true) }} className="gap-2 bg-primary hover:bg-orange-600">
                                        <Plus className="w-4 h-4" /> إضافة قطعة جديدة
                                    </Button>
                                </div>

                                {showAddForm && (
                                    <Card className="bg-slate-900 border-primary/30">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center justify-between">
                                                <span>{editingId ? "تعديل قطعة" : "إضافة قطعة جديدة"}</span>
                                                <Button variant="ghost" size="icon" onClick={resetForm}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-white">اسم القطعة *</Label>
                                                    <Input
                                                        placeholder="مثال: طرمبة بنزين كورسا"
                                                        className="bg-slate-950 border-slate-700 text-white"
                                                        value={newPart.name}
                                                        onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white">الموديلات * (افصل بفاصلة)</Label>
                                                    <Input
                                                        placeholder="مثال: Corsa, Vectra"
                                                        className="bg-slate-950 border-slate-700 text-white"
                                                        value={newPart.models}
                                                        onChange={e => setNewPart({ ...newPart, models: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-white">السنة</Label>
                                                    <Input
                                                        placeholder="مثال: 1994-2000"
                                                        className="bg-slate-950 border-slate-700 text-white"
                                                        value={newPart.year}
                                                        onChange={e => setNewPart({ ...newPart, year: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white">الحالة</Label>
                                                    <select
                                                        className="w-full h-10 bg-slate-950 border border-slate-700 rounded-md px-3 text-white"
                                                        value={newPart.status}
                                                        onChange={e => setNewPart({ ...newPart, status: e.target.value })}
                                                    >
                                                        <option value="available">متوفر</option>
                                                        <option value="unavailable">خلصان</option>
                                                        <option value="inquiry">اسأل</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white">أعراض التلف (افصل بفاصلة)</Label>
                                                <Input
                                                    placeholder="مثال: تأخير في الدوارة, تقطيع"
                                                    className="bg-slate-950 border-slate-700 text-white"
                                                    value={newPart.symptoms}
                                                    onChange={e => setNewPart({ ...newPart, symptoms: e.target.value })}
                                                />
                                            </div>
                                            <Button onClick={handleSavePart} className="w-full bg-primary hover:bg-orange-600">
                                                <Check className="w-4 h-4 ml-2" /> {editingId ? "حفظ التعديلات" : "إضافة القطعة"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                                        <p className="text-3xl font-bold text-white">{parts.length}</p>
                                        <p className="text-slate-400 text-sm">إجمالي القطع</p>
                                    </div>
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                                        <p className="text-3xl font-bold text-green-500">{parts.filter(p => p.status === "available").length}</p>
                                        <p className="text-slate-400 text-sm">متوفر</p>
                                    </div>
                                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                                        <p className="text-3xl font-bold text-red-500">{parts.filter(p => p.status === "unavailable").length}</p>
                                        <p className="text-slate-400 text-sm">خلصان</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
                                    {parts.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">مفيش قطع غيار لسه. اضغط على &quot;إضافة قطعة جديدة&quot;</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {parts.map((part: any) => (
                                                <div key={part.id} className="p-4 hover:bg-white/5 transition-colors">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="font-bold text-white">{part.name}</h3>
                                                                <Badge
                                                                    className={`cursor-pointer ${part.status === "available"
                                                                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                                                        : part.status === "unavailable"
                                                                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                                                            : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                                                                        }`}
                                                                    onClick={() => togglePartStatus(part.id, part.status)}
                                                                >
                                                                    {part.status === "available" ? "متوفر" : part.status === "unavailable" ? "خلصان" : "اسأل"}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                                                <span>الموديلات: {part.models?.join(", ")}</span>
                                                                <span>السنة: {part.year}</span>
                                                            </div>
                                                            {part.symptoms?.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {part.symptoms.map((sym: string, k: number) => (
                                                                        <span key={k} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{sym}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="icon" className="border-blue-500/20 text-blue-500 hover:bg-blue-500/10" onClick={() => startEditing(part)}>
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                                onClick={() => deletePart(part.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Edit Date Modal */}
            {editingBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-4">تعديل معاد الحجز</h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white mb-2 block">اختر التاريخ الجديد</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="bg-slate-950 border-white/10 text-white cursor-pointer pl-10"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newDate ? format(newDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => setNewDate(new Date(e.target.value))}
                                        onClick={(e) => e.currentTarget.showPicker()}
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <Label className="text-white mb-2 block">فترة الحضور</Label>
                                <select
                                    className="w-full h-10 bg-slate-950 border border-white/10 rounded-md px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                >
                                    <option value="">اختر الوقت</option>
                                    {[
                                        "9:00 - 11:00 ص",
                                        "11:00 - 1:00 م",
                                        "1:00 - 3:00 م",
                                        "3:00 - 5:00 م",
                                        "5:00 - 7:00 م",
                                        "7:00 - 9:00 م"
                                    ].map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-primary hover:bg-orange-600" onClick={updateBookingDate}>
                                    حفظ التغيير
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setEditingBooking(null)}>
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Global Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-[100] flex items-center justify-center transition-all animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                        <div className="relative">
                            <RefreshCcw className="w-12 h-12 text-primary animate-spin" />
                            <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse rounded-full" />
                        </div>
                        <p className="text-white font-bold text-lg animate-pulse">جاري معالجة البيانات...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

