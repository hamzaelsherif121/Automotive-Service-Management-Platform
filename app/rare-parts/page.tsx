"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, AlertCircle, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function RarePartsPage() {
    const [parts, setParts] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filterModel, setFilterModel] = useState("all")
    const [requestPart, setRequestPart] = useState("")
    const [requestModel, setRequestModel] = useState("")
    const [requestYear, setRequestYear] = useState("")

    useEffect(() => {
        // Load parts from Supabase
        const fetchParts = async () => {
            const { data, error } = await supabase
                .from('rare_parts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching parts:', error)
            } else if (data) {
                setParts(data)
            }
        }

        fetchParts()
    }, [])

    const filteredParts = parts.filter(part => {
        // Handle case where part properties might be null if DB schema isn't strict or during migration
        const name = part.name || ""
        const symptoms = part.symptoms || []
        const partModels = part.models || []

        const matchesQuery = name.includes(searchQuery) || symptoms.some((s: string) => s.includes(searchQuery))
        const matchesModel = filterModel === "all" || partModels.map((m: string) => m.toLowerCase()).includes(filterModel)
        return matchesQuery && matchesModel
    })

    const getRequestWhatsAppLink = () => {
        const message = `السلام عليكم 👋
محتاج قطعة غيار:
🔧 القطعة: ${requestPart || 'غير محدد'}
🚗 الموديل: ${requestModel || 'غير محدد'}
📅 السنة: ${requestYear || 'غير محدد'}
ممكن تفيدوني بالسعر والتوافر؟`
        return `https://wa.me/201012978622?text=${encodeURIComponent(message)}`
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 pt-24 md:pt-32">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block border border-primary/30 rounded-full px-4 py-1.5 mb-6 bg-primary/10">
                        <span className="text-primary font-bold text-sm">💡 استيراد مضمون 100%</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">قطع غيار نادرة</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        متدورش كتير. عندنا مخزون للقطع اللي "مش موجودة" في السوق.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-16 sticky top-24 z-30 bg-slate-950/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="relative group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="بتدور على قطعة ايه؟ (مثال: طرمبة بنزين كورسا C)"
                            className="pl-4 pr-12 h-14 bg-slate-900/50 backdrop-blur-xl border-slate-700 text-white rounded-full shadow-none focus:border-primary focus:ring-primary/20 text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'corsa', 'vectra', 'astra', 'insignia'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setFilterModel(m)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterModel === m ? 'bg-primary text-white shadow-lg shadow-orange-500/25 scale-105' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'}`}
                            >
                                {m === 'all' ? 'الكل' : m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-7xl mx-auto">
                    {filteredParts.map((part) => (
                        <Card key={part.id} className="bg-slate-900/50 backdrop-blur border-white/5 hover:border-primary/50 transition-all group overflow-hidden">
                            <div className="h-40 bg-slate-800/50 w-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 transition-colors">
                                <Filter className="w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity" />
                            </div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{part.name}</h3>
                                        <span className="text-xs text-slate-400 block mb-1">الموديلات: {part.models.join(", ")}</span>
                                        <span className="text-xs text-slate-500 block">السنة: {part.year}</span>
                                    </div>
                                    <div className="shrink-0">
                                        {part.status === "available" && <Badge className="bg-green-500/10 text-green-500 border-none">متوفر</Badge>}
                                        {part.status === "unavailable" && <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none">خلصان</Badge>}
                                        {part.status === "inquiry" && <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/5">اسأل</Badge>}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 bg-black/20 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 font-medium">علامات التلف (عشان تتأكد):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {part.symptoms.map((sym: string, k: number) => (
                                            <span key={k} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-300 border border-white/5">{sym}</span>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    className="w-full gap-2 font-bold h-10"
                                    variant={part.status === "unavailable" ? "outline" : "default"}
                                    asChild
                                >
                                    <a
                                        href={`https://wa.me/201012978622?text=${encodeURIComponent(
                                            part.status === "unavailable"
                                                ? `السلام عليكم 👋\nعايز أطلب توفير قطعة:\n🔧 ${part.name}\n🚗 الموديل: ${part.models?.join(", ")}\n📅 السنة: ${part.year}\nممكن تفيدوني بالسعر والتوافر؟`
                                                : `السلام عليكم 👋\nعايز أطلب قطعة:\n🔧 ${part.name}\n🚗 الموديل: ${part.models?.join(", ")}\n📅 السنة: ${part.year}`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {part.status === "unavailable" ? "استفسار عن توفيرها" : "استفسر عل واتساب"}
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Not Found / Request Form */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50 mb-6 border border-white/5 shadow-inner">
                        <Search className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">مش لاقي القطعة اللي بتدور عليها؟</h2>
                    <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg">
                        بنوفر قطع الغيار "النواقص" بالطلب من بره مصر. ابعتلنا تفاصيل القطعة وصورة ليها وهنرد عليك بالسعر والتوافر.
                    </p>
                    <div className="max-w-md mx-auto space-y-4">
                        <Input
                            placeholder="اسم القطعة أو وصفها"
                            className="bg-black/20 border-white/10 text-white h-12 focus:border-primary"
                            value={requestPart}
                            onChange={(e) => setRequestPart(e.target.value)}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="موديل السيارة"
                                className="bg-black/20 border-white/10 text-white h-12 focus:border-primary"
                                value={requestModel}
                                onChange={(e) => setRequestModel(e.target.value)}
                                required
                            />
                            <Input
                                placeholder="سنة الصنع"
                                className="bg-black/20 border-white/10 text-white h-12 focus:border-primary"
                                value={requestYear}
                                onChange={(e) => setRequestYear(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            size="lg"
                            className="w-full text-lg font-bold h-12 shadow-lg shadow-primary/20 gap-2"
                            disabled={!requestPart || !requestModel || !requestYear}
                            asChild={!!(requestPart && requestModel && requestYear)}
                        >
                            {requestPart && requestModel && requestYear ? (
                                <a href={getRequestWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                                    ارسل طلب على واتساب
                                </a>
                            ) : (
                                <span>ارسل طلب على واتساب</span>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
