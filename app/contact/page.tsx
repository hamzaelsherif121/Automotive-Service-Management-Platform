import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 pt-24 md:pt-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">تواصل معنا</h1>
                    <p className="text-slate-400">موجودين لخدمتك طول الأسبوع</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Info */}
                    <div className="space-y-8">
                        <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-8 rounded-2xl hover:border-primary/20 transition-colors">
                            <h2 className="text-xl font-bold mb-8 text-white">بيانات التواصل</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">العنوان</h3>
                                        <p className="text-slate-400 leading-relaxed">اللبيني – الهرم<br />خلف قاعة الماسة – شارع ممدوح وهبة<br />(بعد أولاد رجب)</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">التليفون & واتساب</h3>
                                        <div className="space-y-1">
                                            <a href="tel:01012978622" className="text-slate-400 hover:text-primary transition-colors block ltr">01012978622</a>
                                            <a href="tel:01111837276" className="text-slate-400 hover:text-primary transition-colors block ltr">01111837276</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">مواعيد العمل</h3>
                                        <p className="text-slate-400">
                                            السبت - الخميس: 9 صباحاً - 9 مساءً<br />
                                            <span className="text-red-400 font-medium">الجمعة: مغلق</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-8 rounded-2xl hover:border-primary/20 transition-colors">
                            <h2 className="text-xl font-bold mb-6 text-white">ابعتلنا رسالة</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="الاسم" className="bg-slate-950" />
                                    <Input placeholder="الموبايل" className="bg-slate-950" />
                                </div>
                                <select className="flex h-10 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none">
                                    <option>استفسار عام</option>
                                    <option>شكوى</option>
                                    <option>اقتراح</option>
                                </select>
                                <Textarea placeholder="الرسالة..." className="bg-slate-950 h-32" />
                                <Button className="w-full">إرسال</Button>
                            </form>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="h-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3455.0!2d31.1!3d30.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzAwLjAiTiAzMcKwMDYnMDAuMCJF!5e0!3m2!1sen!2seg!4v1600000000000!5m2!1sen!2seg"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        />
                        <div className="absolute bottom-6 left-6 right-6">
                            <Button size="lg" className="w-full shadow-lg" asChild>
                                <a href="https://maps.google.com/?q=Hazem+Opel+Service" target="_blank" rel="noopener noreferrer">
                                    افتح في خرائط Google
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
