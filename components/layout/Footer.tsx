"use client"

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-20 bg-slate-900 border-t border-slate-800 text-slate-300 py-12 pb-32 md:pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">حازم أوبل</h3>
                        <p className="text-sm text-slate-400">
                            مركز صيانة متخصص في سيارات أوبل فقط. خبرة سنين في كل الموديلات من كورسا 94 لحد إنسجنيا.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">روابط سريعة</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
                            <li><Link href="/services" className="hover:text-primary transition-colors">خدماتنا</Link></li>
                            <li><Link href="/booking" className="hover:text-primary transition-colors">احجز معاد</Link></li>
                            <li><Link href="/offers" className="hover:text-primary transition-colors">عروض 2026</Link></li>
                            <li><Link href="/rare-parts" className="hover:text-primary transition-colors">قطع غيار نادرة</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link></li>
                        </ul>
                    </div>

                    {/* Models */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">موديلات نخدمها</h4>
                        <ul className="space-y-2 text-sm">
                            <li>كورسا (Corsa)</li>
                            <li>فيكترا (Vectra)</li>
                            <li>أسترا (Astra)</li>
                            <li>إنسجنيا (Insignia)</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">تواصل معنا</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>اللبيني – الهرم، خلف قاعة الماسة، شارع ممدوح وهبة</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex flex-col">
                                    <a href="tel:01012978622" className="hover:text-white">01012978622</a>
                                    <a href="tel:01111837276" className="hover:text-white">01111837276</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    © 2026 حازم أوبل لخدمات السيارات. جميع الحقوق محفوظة.
                </div>
            </div>
        </footer>
    );
}
