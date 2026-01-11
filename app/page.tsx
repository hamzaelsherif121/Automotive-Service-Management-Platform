"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Car, Search, Calendar, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-16 md:pt-20 overflow-x-hidden">

      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-[-1]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 z-[-1]" />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden flex flex-col justify-center min-h-[75vh]">
        {/* Decorative Blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl lg:mr-0 lg:ml-auto text-right flex flex-col items-start">

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >


              <h1 className="mb-6 text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                <span className="block text-slate-100">صيانة أوبل</span>
                <span className="block text-primary">من كورسا 94</span>
                <span className="block text-slate-100">لحد إنسجنيا</span>
              </h1>

              <p className="mb-8 text-base md:text-xl text-slate-400 font-medium max-w-2xl ml-auto mr-0">
                بنقدر وقتك، عشان كده نظام الحجز عندنا بيضمن لك صيانة دقيقة وبدون انتظار.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-orange-600 text-black shadow-lg shadow-orange-900/20 rounded-xl w-full sm:w-auto" asChild>
                  <Link href="/booking" className="gap-2">
                    احجز الآن <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" className="h-14 px-8 text-lg font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto rounded-xl backdrop-blur-sm" asChild>
                  <a href="https://wa.me/201012978622" target="_blank" rel="noopener noreferrer">
                    <span className="ml-2">للاستفسارات (واتساب)</span>
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  </a>
                </Button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Services Grid with Hover Effects */}
      <section className="py-24 bg-slate-950/50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-white mb-4 leading-normal">خدمات احترافية<br /><span className="text-primary">لكل موديلات أوبل</span></h2>
              <p className="text-slate-400 text-lg">كل اللي عربيتك محتاجاه في مكان واحد. من غيار الزيت للعمرة الكاملة.</p>
            </div>
            <Button variant="link" className="text-primary gap-2" asChild>
              <Link href="/services">عرض كل الخدمات <ArrowLeft className="w-4 h-4" /></Link>
            </Button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "صيانة دورية", icon: Wrench, color: "text-blue-400", bg: "bg-blue-500/10" },
              { title: "فحص كمبيوتر", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
              { title: "عفشة وتربيط", icon: Car, color: "text-green-400", bg: "bg-green-500/10" },
              { title: "قطع نادرة", icon: Search, color: "text-orange-400", bg: "bg-orange-500/10" },
            ].map((service, i) => (
              <Link key={i} href="/services">
                <motion.div variants={fadeInUp}>
                  <Card className="bg-slate-900/50 border-white/5 hover:border-primary/50 transition-all duration-300 hover:transform hover:-translate-y-2 group h-full">
                    <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center">
                      <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`w-8 h-8 ${service.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{service.title}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Us - Glassmorphism Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">ليه تختار <span className="text-primary">حازم أوبل؟</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "ضمان حقيقي",
                desc: "مش مجرد كلام. بنضمن شغلنا وقطع الغيار عشان احنا واثقين في جودتنا."
              },
              {
                icon: Wrench,
                title: "متخصص مش 'بتاع كله'",
                desc: "مش بنشتغل في أي ماركة تانية. أوبل لعبتنا وخبرتنا فيها من سنين."
              },
              {
                icon: Calendar,
                title: "بنحترم وقتك",
                desc: "نظام حجز صارم عشان متضيعش يومك في الورشة. تيجي في معادك تمشي في معادك."
              },
            ].map((item, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-colors">
                <CardContent className="p-8">
                  <item.icon className="w-10 h-10 text-primary mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 p-8 md:p-16 text-center">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">جاهز تدلع عربيتك؟</h2>
              <p className="text-orange-100 text-lg md:text-xl mb-10">
                استفيد من عرض بداية 2026: خصم 15% على القطع + هدايا مجانية مع الصيانة الكاملة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold shadow-xl" asChild>
                  <Link href="/booking">احجز معادك</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-black/20 border-white/20 text-white hover:bg-black/40 backdrop-blur-sm" asChild>
                  <Link href="/offers">تفاصيل العرض</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
