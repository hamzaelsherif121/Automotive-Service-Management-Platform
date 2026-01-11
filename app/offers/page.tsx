"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gift, CheckCircle, Copy, Send, ArrowRight, MapPin, Phone, Wrench, AlertTriangle, Car, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

const OFFER_CODE = "G26"

const MODEL_OFFERS = [
    {
        id: "corsa94",
        name: "كورسا 94",
        discount: "خصم خاص مع صيانة كاملة للسيارة",
        gifts: ["بوجيه", "فلتر هواء"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "corsa2005",
        name: "كورسا سيدان 2005",
        discount: "خصم مع الصيانة الكاملة",
        gifts: ["بوجيه", "فلتر هواء"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "vectraB",
        name: "فيكترا B (97 – 2000)",
        discount: "خصم مع صيانة السيارة بالكامل",
        gifts: ["بوجيه", "فلتر زيت أو هواء"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "astraG",
        name: "أسترا G (2000 – 2005)",
        discount: "خصم مع الصيانة الكاملة",
        gifts: ["بوجيه", "فلتر زيت"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "astraJ",
        name: "أسترا J موديل 2015",
        discount: "خصم مع صيانة السيارة بالكامل",
        gifts: ["فلتر هواء", "فلتر تكييف"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "insigniaA",
        name: "إنسجنيا A",
        discount: "خصم مع الصيانة الكاملة",
        gifts: ["فلتر هواء", "فلتر تكييف"],
        bonus: "تربيط عفشة مجاني"
    },
    {
        id: "insigniaB",
        name: "إنسجنيا B",
        discount: "خصم مع صيانة السيارة بالكامل",
        gifts: ["فلتر هواء", "فلتر تكييف"],
        bonus: "تربيط عفشة مجاني"
    }
]

const SPECIAL_OFFERS = [
    { title: "قواعد المحرك", desc: "عليها عرض خاص" },
    { title: "العفشة", desc: "خصم + تربيط مجاني" },
    { title: "العمرات", desc: "أسعار خاصة داخل العرض" }
]

const TERMS = [
    "العرض مع الصيانة فقط",
    "الهدايا غير قابلة للاستبدال",
    "مرة واحدة لكل سيارة",
    "حسب توافر القطع"
]

export default function OffersPage() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [showCode, setShowCode] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (name.length > 2 && phone.length > 8 && selectedModel) {
            setShowCode(true)

            // Save lead via API to trigger Telegram notification
            try {
                const res = await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: crypto.randomUUID(),
                        name,
                        phone,
                        offer_title: selectedModel,
                        status: 'new'
                    })
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.error || 'Failed to save lead')
                }
            } catch (error) {
                console.error('Error saving lead:', error)
            }
        }
    }

    const selectedOffer = MODEL_OFFERS.find(m => m.id === selectedModel)

    const getWhatsAppLink = () => {
        const modelName = selectedOffer?.name || "أوبل"
        return `https://wa.me/201012978622?text=${encodeURIComponent(`السلام عليكم، معايا ${modelName} وعايز أستفيد من عرض بداية 2026 - كود ${OFFER_CODE}`)}`
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 pt-24 md:pt-32">
            <div className="container mx-auto px-4">

                {/* Header Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 p-8 md:p-12 text-center mb-10 shadow-2xl shadow-orange-900/50">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">🔥 عرض بداية سنة 2026 – حازم أوبل 🔥</h1>
                        <div className="flex items-center justify-center gap-2 text-orange-100 mb-4">
                            <MapPin className="w-5 h-5" />
                            <span>اللبيني – الهرم | خلف قاعة الماسة – شارع ممدوح وهبة</span>
                        </div>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-2 text-lg">
                            خصم 15% على أي قطع جديدة داخل المركز
                        </Badge>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-10 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-yellow-400 mb-1">⚠️ تنبيه مهم</h3>
                        <p className="text-yellow-200/80">العرض ساري مع صيانة السيارة الكاملة فقط (مش بيع قطع منفرد)</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                    {/* Left Column - Model Offers */}
                    <div className="lg:col-span-2 space-y-6">

                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Car className="text-primary w-7 h-7" />
                            🚗 العروض حسب الموديل
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            {MODEL_OFFERS.map((model) => (
                                <div
                                    key={model.id}
                                    className={`bg-slate-900/70 rounded-2xl p-5 border transition-all cursor-pointer ${selectedModel === model.id
                                        ? 'border-primary ring-2 ring-primary/30'
                                        : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                    onClick={() => setSelectedModel(model.id)}
                                >
                                    <h3 className="font-bold text-primary text-lg mb-3">🔹 {model.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-slate-300 flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            {model.discount}
                                        </p>
                                        <p className="text-slate-300 flex items-start gap-2">
                                            <Gift className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                            🎁 {model.gifts.join(" + ")}
                                        </p>
                                        <p className="text-slate-300 flex items-start gap-2">
                                            <Wrench className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                            🔧 {model.bonus}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Special Offers - Heavy Work */}
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 mt-8">
                            <h3 className="text-xl font-bold text-white mb-4">🔧 عروض خاصة على الشغل التقيل:</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {SPECIAL_OFFERS.map((offer, i) => (
                                    <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                        <span className="text-green-400 font-bold">🟢 {offer.title}</span>
                                        <p className="text-slate-400 text-sm mt-1">→ {offer.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">العرض يشمل:</h3>
                            <ul className="space-y-2 text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    خصم 15% على أي قطع جديدة داخل المركز أو بيع خارج المركز
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    هدايا للعملاء مع الصيانة
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    تربيط عفشة مجاني لجميع الموديلات
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    فحص وصيانة الفرامل (فحص – تنظيف – ضبط)
                                </li>
                            </ul>
                        </div>

                        {/* Terms */}
                        <div className="bg-slate-900/30 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">⚠️ شروط العرض:</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {TERMS.map((term, i) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                        <CheckCircle className="w-4 h-4 text-orange-500" />
                                        {term}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Lead Capture Form */}
                    <div className="lg:col-span-1">
                        <Card className="bg-slate-900 border-slate-800 shadow-2xl lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl text-white">🎟️ احصل على كود الخصم</CardTitle>
                                <CardDescription className="text-slate-400">
                                    اكتب موديل وسنة السيارة وهنبعتلك الكود على واتساب
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showCode ? (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-white">اختار موديل عربيتك</Label>
                                            <Select value={selectedModel} onValueChange={setSelectedModel} required>
                                                <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-12">
                                                    <SelectValue placeholder="اختار الموديل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MODEL_OFFERS.map(model => (
                                                        <SelectItem key={model.id} value={model.id}>
                                                            {model.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Show selected offer preview */}
                                        {selectedOffer && (
                                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                                                <p className="text-sm text-slate-300 mb-2">هديتك:</p>
                                                <p className="font-bold text-white">🎁 {selectedOffer.gifts.join(" + ")}</p>
                                                <p className="text-sm text-green-400 mt-1">🔧 {selectedOffer.bonus}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-white flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                اسمك
                                            </Label>
                                            <Input
                                                placeholder="الاسم بالكامل"
                                                className="bg-slate-950 border-slate-700 text-white h-12"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                رقم الواتساب
                                            </Label>
                                            <Input
                                                placeholder="01xxxxxxxxx"
                                                className="bg-slate-950 border-slate-700 text-white h-12 text-left ltr font-mono"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-bold bg-primary hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20"
                                            disabled={!selectedModel || phone.length < 9 || name.length < 3}
                                        >
                                            احصل على الكود <ArrowRight className="mr-2 w-5 h-5" />
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="text-center space-y-5 py-4">
                                        <div className="bg-green-500/10 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                        </div>

                                        <div>
                                            <h3 className="text-white font-bold text-lg mb-2">كودك جاهز! 🎉</h3>
                                            <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border-2 border-dashed border-primary/50">
                                                <span className="font-mono text-2xl font-bold text-primary tracking-widest">{OFFER_CODE}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => navigator.clipboard.writeText(OFFER_CODE)}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {selectedOffer && (
                                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-right">
                                                <p className="text-sm text-slate-300 mb-1">🎁 هديتك:</p>
                                                <p className="font-bold text-white">{selectedOffer.gifts.join(" + ")}</p>
                                                <p className="text-sm text-green-400 mt-1">🔧 {selectedOffer.bonus}</p>
                                            </div>
                                        )}

                                        <Button
                                            className="w-full h-12 gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold"
                                            asChild
                                        >
                                            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                                                <Send className="w-5 h-5" />
                                                فعّل العرض على واتساب
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <div className="mt-6 bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">📞 للتواصل:</h3>
                            <div className="space-y-3">
                                <a
                                    href="tel:01012978622"
                                    className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span className="font-mono">01012978622</span>
                                </a>
                                <a
                                    href="tel:01111837276"
                                    className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span className="font-mono">01111837276</span>
                                </a>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <div className="flex items-start gap-3 text-slate-400 text-sm">
                                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>اللبيني – الهرم<br />بعد أولاد رجب – خلف قاعة الماسة – شارع ممدوح وهبة</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
