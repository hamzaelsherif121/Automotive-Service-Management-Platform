"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle, CheckCircle, Tag, ArrowRight } from "lucide-react"

// Mock Component Database
const MODELS_DATA: Record<string, any> = {
    corsa: {
        name: "Opel Corsa",
        arName: "أوبل كورسا",
        desc: "الأكثر شعبية واقتصادية. بنفهم في مشاكل طلمبة البنزين والحرارة كويس.",
        image: "corsa-bg", // Abstract class/gradient
        commonIssues: [
            "تلف طلمبة البنزين",
            "تسريب مياه الرادياتير",
            "مشاكل علبة الدركسيون",
            "حساس الكرنك"
        ],
        services: ["صيانة دورية", "تغيير طلمبة", "ضبط زوايا", "فحص كمبيوتر"]
    },
    vectra: {
        name: "Opel Vectra",
        arName: "أوبل فيكترا",
        desc: "وحش الطريق. عفشتها وموتورها لعبتنا، خصوصاً مشاكل الفتيس والكهرباء.",
        image: "vectra-bg",
        commonIssues: [
            "مشاكل الفتيس (Easytronic)",
            "حساسات الشكمان",
            "ارتفاع الحرارة",
            "ضفيرة الكهرباء"
        ],
        services: ["عمرة فتيس", "تغيير زيت فتيس", "صيانة تبريد", "كشف أعطال"]
    },
    astra: {
        name: "Opel Astra",
        arName: "أوبل أسترا",
        desc: "الأناقة والأداء. بنحل مشاكل التيربو وحساسات الموتور بضمان.",
        image: "astra-bg",
        commonIssues: [
            "مشاكل التيربو",
            "بلف التبخير (PCV)",
            "تكسير البساتم (LSPI)",
            "تسريب زيت"
        ],
        services: ["صيانة تيربو", "تنظيف دورة حقن", "تغيير زيت Dexos 1", "فحص شامل"]
    },
    insignia: {
        name: "Opel Insignia",
        arName: "أوبل إنسجنيا",
        desc: "الفخامة. محتاجة معاملة خاصة وقطع أصلية، وده اللي بنوفرهولك.",
        image: "insignia-bg",
        commonIssues: [
            "تلف التيربو",
            "حساسات ضغط الإطارات",
            "مشاكل طلمبة الضغط العالي",
            "علبة البيئة"
        ],
        services: ["تغيير زيت و تيل أصلي", "صيانة دورية", "برمجة كنترولات", "عفشة كاملة"]
    }
}

export default function ModelPage() {
    const params = useParams()
    const slug = params.slug as string
    const model = MODELS_DATA[slug]

    if (!model) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">الموديل غير موجود</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pt-24 pb-12">

            {/* Hero for Model */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-slate-900/50 z-0" />
                <div className="container relative z-10 px-4 text-center">
                    <Badge className="mb-4 bg-primary text-black hover:bg-primary/90 text-base py-1 px-4">{model.name}</Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6 drop-shadow-sm">
                        صيانة {model.arName}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {model.desc}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Common Issues */}
                    <Card className="bg-slate-900/80 backdrop-blur border-white/10 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white text-2xl">
                                <AlertTriangle className="text-orange-500 animate-pulse" /> مشاكل {model.arName} الشائعة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {model.commonIssues.map((issue: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        <span className="text-slate-300 font-medium">{issue}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-300 text-sm flex gap-3">
                                <Wrench className="shrink-0" />
                                بنوفر حلول نهائية للمشاكل دي مع ضمان على الصيانة 6 شهور.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Solutions & CTA */}
                    <div className="space-y-8">
                        <Card className="bg-gradient-to-br from-primary/20 to-slate-900 border-primary/20">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">عرض خاص لملاك {model.arName}</h3>
                                        <p className="text-slate-300">احجز صيانتك النهاردة واحصل على خصم إضافي.</p>
                                    </div>
                                    <Tag className="w-10 h-10 text-primary opacity-80" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {model.services.map((s: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-200">
                                            <CheckCircle className="w-4 h-4 text-primary" /> {s}
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full h-14 text-lg font-bold bg-primary hover:bg-orange-600 shadow-lg shadow-orange-900/20" asChild>
                                    <Link href={`/booking?model=${slug}`}>
                                        احجز صيانة {model.arName} الآن <ArrowRight className="mr-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 text-slate-300" asChild>
                                <Link href="/rare-parts">
                                    <Tag className="w-6 h-6 text-primary" />
                                    قطع غيار {model.name}
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 text-slate-300" asChild>
                                <Link href="/offers">
                                    <Tag className="w-6 h-6 text-primary" />
                                    عروض {model.name}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
