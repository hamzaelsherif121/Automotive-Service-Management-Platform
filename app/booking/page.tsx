"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Car, Wrench, Calendar, CheckCircle, ChevronRight, ChevronLeft, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
const bookingSchema = z.object({
    model: z.string().min(1, "الرجاء اختيار موديل السيارة"),
    year: z.string().min(1, "الرجاء اختيار سنة الصنع"),
    services: z.array(z.string()).min(1, "الرجاء اختيار خدمة واحدة على الأقل"),
    description: z.string(),
    date: z.string().min(1, "الرجاء اختيار التاريخ"),
    time: z.string().min(1, "الرجاء اختيار الفترة"),
    name: z.string().min(3, "الاسم يجب أن يكون 3 حروف على الأقل"),
    phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم موبايل مصري غير صحيح"),
    contactMethod: z.string()
})

type BookingData = z.infer<typeof bookingSchema>

const OPEL_MODELS = [
    { id: "corsa", name: "أوبل كورسا (Corsa)", years: ["1994-2000", "2001-2006", "2007-2014", "2015-2019", "2020+"] },
    { id: "vectra", name: "أوبل فيكترا (Vectra)", years: ["1996-2002 (B)", "2003-2008 (C)"] },
    { id: "astra", name: "أوبل أسترا (Astra)", years: ["1998-2004 (G)", "2005-2011 (H)", "2012-2016 (J)", "2017+ (K)"] },
    { id: "insignia", name: "أوبل إنسجنيا (Insignia)", years: ["2009-2017 (A)", "2018+ (B)"] },
    { id: "other", name: "موديل آخر", years: [] }
]

const SERVICES_LIST = [
    { id: "maintenance", name: "صيانة دورية كاملة" },
    { id: "checkup", name: "فحص كمبيوتر" },
    { id: "suspension", name: "عفشة وتربيط" },
    { id: "brakes", name: "فرامل" },
    { id: "electric", name: "كهرباء" },
    { id: "ac", name: "تكييف" },
    { id: "mounts", name: "قواعد محرك" },
    { id: "overhaul", name: "عمرة (أوفرهول)" },
    { id: "unknown", name: "مشكلة مش عارف سببها" }
]

const TIME_SLOTS = [
    "9:00 - 11:00 ص",
    "11:00 - 1:00 م",
    "1:00 - 3:00 م",
    "3:00 - 5:00 م",
    "5:00 - 7:00 م",
    "7:00 - 9:00 م"
]

export default function BookingPage() {
    const [step, setStep] = useState(1)
    const { register, handleSubmit: handleFormSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm<BookingData>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            model: "",
            year: "",
            services: [],
            description: "",
            date: "",
            time: "",
            name: "",
            phone: "",
            contactMethod: "whatsapp"
        }
    })

    const formData = watch()
    const [submitted, setSubmitted] = useState(false)
    const [bookingRef, setBookingRef] = useState("")

    const toggleService = (serviceId: string) => {
        const currentServices = formData.services
        const newServices = currentServices.includes(serviceId)
            ? currentServices.filter(s => s !== serviceId)
            : [...currentServices, serviceId]
        setValue("services", newServices, { shouldValidate: true })
    }

    const handleNext = async () => {
        let fieldsToValidate: (keyof BookingData)[] = []
        if (step === 1) fieldsToValidate = ["model", "year"]
        if (step === 2) fieldsToValidate = ["services"]
        if (step === 4) fieldsToValidate = ["date", "time"]
        if (step === 5) fieldsToValidate = ["name", "phone"]

        const isValid = await trigger(fieldsToValidate)
        if (isValid) setStep(prev => prev + 1)
    }
    const handleBack = () => setStep(prev => prev - 1)

    const onSubmit: SubmitHandler<BookingData> = async (data) => {
        // Generate UUID first so we can use a slice of it as the reference
        const id = crypto.randomUUID()
        const ref = id.slice(0, 8)

        // Prepare data for Supabase
        // Note: Schema has limited fields, so we concat some info
        const servicesString = data.services.map(s => SERVICES_LIST.find(sl => sl.id === s)?.name).join(", ")
        const fullServiceDetails = `${servicesString} | ⏰ ${data.time} | 📝 ${data.description || "No notes"}`
        const carDetails = `${data.model} (${data.year})`

        const payload = {
            id: id,
            name: data.name,
            phone: data.phone,
            car_model: carDetails,
            service_type: fullServiceDetails,
            date: new Date(data.date).toISOString(),
            status: 'pending'
        }

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (!response.ok) {
                alert(result.error || `حدث خطأ أثناء الحجز`)
            } else {
                setBookingRef(ref) // Now this matches what the admin sees
                setSubmitted(true)
            }
        } catch (error) {
            alert("حدث خطأ في الاتصال بالخادم")
        }
    }

    const getWhatsAppLink = () => {
        const serviceNames = formData.services.map((s: string) => SERVICES_LIST.find((sl: any) => sl.id === s)?.name).join(", ")
        const text = `السلام عليكم 👋
حابب أأكد حجزي:
🚗 السيارة: ${formData.model} ${formData.year}
🔧 الخدمة: ${serviceNames}
📝 الوصف: ${formData.description || "لا يوجد"}
📅 المعاد: ${formData.date} - ${formData.time}
👤 الاسم: ${formData.name}
رقم الطلب: #${bookingRef}
في انتظار تأكيدكم ✅`
        return `https://wa.me/201012978622?text=${encodeURIComponent(text)}`
    }

    const getGoogleCalendarLink = () => {
        const dateStr = formData.date.replace(/-/g, ""); // YYYYMMDD
        let startH = 9, endH = 11;

        if (formData.time.includes("9:00 - 11:00 ص")) { startH = 9; endH = 11; }
        else if (formData.time.includes("11:00 - 1:00 م")) { startH = 11; endH = 13; }
        else if (formData.time.includes("1:00 - 3:00 م")) { startH = 13; endH = 15; }
        else if (formData.time.includes("3:00 - 5:00 م")) { startH = 15; endH = 17; }
        else if (formData.time.includes("5:00 - 7:00 م")) { startH = 17; endH = 19; }
        else if (formData.time.includes("7:00 - 9:00 م")) { startH = 19; endH = 21; }

        const start = `${dateStr}T${startH.toString().padStart(2, '0')}0000`;
        const end = `${dateStr}T${endH.toString().padStart(2, '0')}0000`;

        const title = encodeURIComponent("صيانة حازم أوبل 🔧");
        const serviceNames = formData.services.map(s => SERVICES_LIST.find(i => i.id === s)?.name).join(", ");
        const details = encodeURIComponent(`حجز صيانة لسيارة ${formData.model} (${formData.year})\nالخدمات: ${serviceNames}\nرقم الطلب: #${bookingRef}`);

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center py-24 px-4">
                <div className="max-w-xl w-full text-center">
                    <div className="mb-8 flex justify-center animate-in zoom-in duration-500">
                        <div className="h-32 w-32 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-white">تم استلام طلب حجزك! 🎉</h1>
                    <p className="text-xl text-slate-400 mb-8">رقم الطلب: <span className="font-mono font-bold text-primary text-2xl mx-2">#{bookingRef}</span></p>

                    <div className="bg-slate-900/50 backdrop-blur rounded-2xl p-8 mb-8 text-right border border-white/10 shadow-xl">
                        <h3 className="text-white font-bold text-lg mb-4 border-b border-white/10 pb-4">ملخص الحجز</h3>
                        <ul className="space-y-3 text-slate-300">
                            <li><span className="text-slate-500 ml-2">السيارة:</span> {formData.model} ({formData.year})</li>
                            <li><span className="text-slate-500 ml-2">المعاد:</span> {formData.date} | {formData.time}</li>
                            <li><span className="text-slate-500 ml-2">الخدمات:</span> {formData.services.map(s => SERVICES_LIST.find(i => i.id === s)?.name).join("، ")}</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button size="lg" className="w-full gap-2 h-14 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E]" asChild>
                            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                                إرسال التفاصيل واتساب (تأكيد نهائي)
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full gap-2 h-14 text-lg font-bold border-white/10 text-white hover:bg-white/5" asChild>
                            <a href={getGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
                                <Calendar className="w-5 h-5 text-primary" /> إضافة لتقويم جوجل (تذكير)
                            </a>
                        </Button>
                        <Button variant="ghost" className="text-slate-400 hover:text-white" asChild>
                            <Link href="/">رجوع للرئيسية</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 pt-24 md:pt-32">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">احجز معاد صيانة</h1>
                    <p className="text-slate-400 text-lg">خطوات بسيطة وهنأكد معاك المعاد عشان متضيعش وقتك.</p>
                </div>

                {/* Progress */}
                <div className="flex justify-between mb-12 relative max-w-2xl mx-auto px-4">
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -z-10 -translate-y-1/2 rounded-full" />
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 ${step >= i ? "bg-primary border-slate-950 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-110" : "bg-slate-900 border-slate-800 text-slate-600"}`}>
                            {i}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1: Model */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white"><Car className="w-6 h-6 text-primary" /> نوع عربيتك ايه؟</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {OPEL_MODELS.map((model) => (
                                        <div
                                            key={model.id}
                                            className={`cursor-pointer transition-all p-4 rounded-xl border flex items-center gap-4 ${formData.model === model.name ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-white/20"}`}
                                            onClick={() => setValue("model", model.name, { shouldValidate: true })}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.model === model.name ? "border-primary" : "border-slate-500"}`}>
                                                {formData.model === model.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <span className="font-bold text-lg">{model.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.model && <p className="text-red-500 text-sm">{errors.model.message}</p>}

                                {formData.model && (
                                    <div className="animate-in fade-in slide-in-from-top-2 pt-4">
                                        <Label className="text-white mb-2 block text-lg">سنة الصنع</Label>
                                        <select
                                            className="flex h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                                            value={formData.year}
                                            onChange={(e) => setValue("year", e.target.value, { shouldValidate: true })}
                                        >
                                            <option value="">اختار السنة</option>
                                            {OPEL_MODELS.find(m => m.name === formData.model)?.years.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                            <option value="other">سنة أخرى</option>
                                        </select>
                                        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Services */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white"><Wrench className="w-6 h-6 text-primary" /> محتاجة شغل ايه؟</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {SERVICES_LIST.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`cursor-pointer transition-all p-4 rounded-xl border flex items-center gap-4 ${formData.services.includes(service.id) ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-white/20"}`}
                                            onClick={() => toggleService(service.id)}
                                        >
                                            <div className={`w-5 h-5 rounded hover:border-primary border flex items-center justify-center ${formData.services.includes(service.id) ? "bg-primary border-primary text-black" : "border-slate-500"}`}>
                                                {formData.services.includes(service.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="font-bold text-lg">{service.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.services && <p className="text-red-500 text-sm">{errors.services.message}</p>}
                            </div>
                        )}

                        {/* Step 3: Description */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold text-white">تفاصيل زيادة (اختياري)</h2>
                                <Textarea
                                    placeholder="اكتب أي تفاصيل عن المشكلة أو أعراض بتلاحظها..."
                                    className="h-40 bg-slate-900/50 border-white/10 text-white text-lg p-4 focus:ring-primary"
                                    {...register("description")}
                                />
                                <p className="text-sm text-slate-400">مثال: السيارة بتفصل على السرعة، صوت في العفشة، لمبة تيك منورة...</p>
                            </div>
                        )}

                        {/* Step 4: Date & Time */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white"><Calendar className="w-6 h-6 text-primary" /> المعاد المناسب ليك</h2>
                                <div className="grid gap-8">
                                    <div>
                                        <Label className="text-white mb-3 block text-lg">التاريخ</Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                dir="ltr"
                                                className="bg-slate-900 border-white/10 text-white h-12 text-lg pr-12 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                min={new Date().toISOString().split('T')[0]}
                                                {...register("date")}
                                                style={{ colorScheme: "dark" }}
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                                        <p className="text-sm text-slate-500 mt-2">الجمعة راحة للفريق *</p>
                                    </div>

                                    <div>
                                        <Label className="text-white mb-3 block text-lg">الفترة</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {TIME_SLOTS.map((slot) => (
                                                <div
                                                    key={slot}
                                                    className={`text-sm border rounded-xl p-4 text-center cursor-pointer transition-all ${formData.time === slot ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800"}`}
                                                    onClick={() => setValue("time", slot, { shouldValidate: true })}
                                                >
                                                    {slot}
                                                </div>
                                            ))}
                                        </div>
                                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Contact Info */}
                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold text-white">بيانات التواصل</h2>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-white text-lg">اسمك</Label>
                                        <Input
                                            placeholder="الاسم بالكامل"
                                            className="bg-slate-900 border-white/10 text-white h-12 text-lg"
                                            {...register("name")}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white text-lg">رقم الموبايل (واتساب)</Label>
                                        <Input
                                            placeholder="01xxxxxxxxx"
                                            type="tel"
                                            className="bg-slate-900 border-white/10 text-white h-12 text-lg font-mono text-left ltr"
                                            {...register("phone")}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Confirm */}
                        {step === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold text-white">مراجعة الحجز</h2>
                                <Card className="bg-slate-900/50 border-white/10">
                                    <CardContent className="p-8 space-y-4">
                                        <div className="flex justify-between border-b border-white/5 pb-4">
                                            <span className="text-slate-400">السيارة:</span>
                                            <span className="font-bold text-white text-lg">{formData.model} {formData.year}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-4">
                                            <span className="text-slate-400">الخدمات:</span>
                                            <span className="font-bold text-white text-left">{formData.services.map(s => SERVICES_LIST.find(i => i.id === s)?.name).join(", ") || "غير محدد"}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-4">
                                            <span className="text-slate-400">المعاد:</span>
                                            <span className="font-bold text-white text-lg">{formData.date} - {formData.time}</span>
                                        </div>
                                        <div className="flex justify-between pb-2">
                                            <span className="text-slate-400">الاسم:</span>
                                            <span className="font-bold text-white">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">الموبايل:</span>
                                            <span className="font-bold text-white font-mono">{formData.phone}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                                    <input type="checkbox" id="terms" className="w-5 h-5 accent-primary rounded bg-slate-900 border-white/20" defaultChecked />
                                    <Label htmlFor="terms" className="text-base text-white">موافق إن المعاد ده مبدئي، وهيتأكد معايا واتساب عشان لو فيه زحمة.</Label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
                            {step > 1 ? (
                                <Button variant="outline" onClick={handleBack} disabled={step === 1} className="text-lg px-8 border-white/10 text-white hover:bg-white/10">
                                    <ChevronRight className="w-5 h-5 ml-2" /> السابق
                                </Button>
                            ) : <div />}

                            {step < 6 ? (
                                <Button onClick={handleNext} size="lg" className="text-lg px-8 bg-primary hover:bg-orange-600 font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                                    التالي <ChevronLeft className="w-5 h-5 mr-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleFormSubmit(onSubmit)} size="lg" className="text-lg px-8 bg-green-600 hover:bg-green-700 font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)]" disabled={isSubmitting}>
                                    {isSubmitting ? "جاري الحفظ..." : "تأكيد الحجز"} <CheckCircle className="w-5 h-5 mr-2" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Summary (Desktop) */}
                    <div className="hidden lg:block h-fit sticky top-32">
                        <Card className="bg-slate-900/80 backdrop-blur border-white/10 shadow-2xl">
                            <CardContent className="p-8">
                                <h3 className="font-bold mb-6 flex items-center gap-2 text-white text-xl border-b border-white/10 pb-4"><Clock className="w-5 h-5 text-primary" /> ملخص الطلب</h3>
                                <div className="space-y-6 text-sm">
                                    {formData.model && (
                                        <div>
                                            <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">السيارة</span>
                                            <span className="font-bold text-white text-lg">{formData.model} {formData.year}</span>
                                        </div>
                                    )}
                                    {formData.services.length > 0 && (
                                        <div>
                                            <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">الخدمات</span>
                                            <ul className="list-disc list-inside text-slate-300 space-y-1">
                                                {formData.services.map(s => <li key={s}>{SERVICES_LIST.find(i => i.id === s)?.name}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {formData.date && (
                                        <div>
                                            <span className="text-slate-500 block text-xs mb-1 uppercase tracking-wider">المعاد</span>
                                            <div className="font-bold text-white text-lg bg-white/5 p-2 rounded-lg text-center border border-white/5">
                                                {formData.date}<br />
                                                <span className="text-primary">{formData.time}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
