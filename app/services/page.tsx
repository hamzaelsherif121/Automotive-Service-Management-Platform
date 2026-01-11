import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Zap, Disc, Wind, Settings, Monitor, Layers, Timer, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
    const services = [
        { id: "maintenance", title: "صيانة دورية كاملة", icon: Settings, desc: "تغيير زيوت وفلاتر (أصلي/GM)، فحص سيور، فحص دورة التبريد، تربيط كامل، وتشحيم." },
        { id: "computer", title: "فحص كمبيوتر", icon: Monitor, desc: "أجهزة Tech2 و MDI الأصلية لكشف الأعطال وتكويد الوحدات (كنترولات، مفاتيح، شاشات)." },
        { id: "suspension", title: "عفشة وتربيط", icon: Wrench, desc: "تغيير مساعدين، جلب مقصات، بارات، وكشف على الاسكاترا وضبط زوايا." },
        { id: "brakes", title: "فرامل", icon: Disc, desc: "تغيير تيل وطنابير، تغيير زيت الفرامل، صيانة فرامل اليد (Electronic Parking Brake)." },
        { id: "ac", title: "تكييف", icon: Wind, desc: "شحن فريون، كبس دورة، تغيير كباسات، تنظيف ثلاجة، وإصلاح بوابات التكييف." },
        { id: "electric", title: "كهرباء", icon: Zap, desc: "إصلاح ضفائر، مارش، دينامو، وحدات رفع الزجاج، وإضاءة." },
        { id: "mounts", title: "قواعد محرك", icon: Layers, desc: "تغيير قواعد الموتور والفتيس لتقليل الاهتزازات وضمان ثبات المحرك." },
        { id: "overhaul", title: "عمرة (أوفرهول)", icon: Timer, desc: "تجديد شامل للمحرك (شمبر، سبايك، وش سلندر) بأجزاء أصلية لرجوع الموتور لحالته." },
        { id: "unknown", title: "تشخيص عطل مجهول", icon: HelpCircle, desc: "لو العربية فيها مشكلة ومحدش عارف يوصلها، بنفحصها ونطلعلك التقرير بالمطلوب." },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 pt-24 md:pt-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/20">
                        <Wrench className="w-4 h-4" /> خدماتنا
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">خدمات صيانة شاملة</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">كل الموديلات، كل الأعطال. تشخيص دقيق باستخدام أحدث أجهزة أوبل الأصلية.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {services.map((service) => (
                        <div key={service.id} id={service.id} className="scroll-mt-32">
                            <Card className="bg-slate-900/50 backdrop-blur border-white/5 h-full hover:border-primary/50 transition-all hover:bg-slate-900 hover:shadow-xl group">
                                <CardContent className="p-8 flex gap-6">
                                    <div className="shrink-0 bg-slate-800 p-4 rounded-2xl h-fit group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <service.icon className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                                        <p className="text-slate-400 leading-relaxed mb-6">
                                            {service.desc}
                                        </p>
                                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all" asChild>
                                            <Link href={`/booking?service=${service.id}`}>
                                                احجز {service.title}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
