import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const cookieStore = await cookies()
        const lastBooking = cookieStore.get('last_booking')

        // Get today's date in YYYY-MM-DD format for Cairo timezone
        const today = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Africa/Cairo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date())

        // Check if cookie exists and matches today
        if (lastBooking && lastBooking.value === today) {
            return NextResponse.json(
                { error: 'انت بالفعل لسة حاجز النهاردة' },
                { status: 429 } // Too Many Requests
            )
        }

        // Insert into Supabase
        const { id, name, phone, car_model, service_type, date, status } = body
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    id,
                    name,
                    phone,
                    car_model,
                    service_type,
                    date,
                    status
                }
            ])
            .select()

        if (error) {
            throw error
        }

        // Send Telegram notification to admin
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const bookingDate = new Date(date).toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            const telegramMessage = `🚗 <b>حجز جديد!</b>

👤 <b>الاسم:</b> ${name}
📱 <b>الموبايل:</b> ${phone}
🚙 <b>السيارة:</b> ${car_model}
🔧 <b>الخدمة:</b> ${service_type.split('|')[0].trim()}
📅 <b>التاريخ:</b> ${bookingDate}
⏰ <b>الوقت:</b> ${service_type.match(/⏰\s([^|]+)/)?.[1]?.trim() || 'غير محدد'}

🔗 <a href="https://hazemopel.com/admin">فتح لوحة التحكم</a>`

            // Call Telegram API directly and wait for it
            try {
                const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: telegramMessage,
                        parse_mode: 'HTML',
                    }),
                })
                const telegramResult = await telegramResponse.json()
                console.log('Telegram API response:', telegramResult)
            } catch (err) {
                console.error('Telegram notification failed:', err)
            }
        } else {
            console.log('Telegram credentials missing - skipping notification')
        }

        // Create response
        const response = NextResponse.json({ success: true, booking: data })

        // Set cookie for rate limiting (expires in 24 hours just to be safe, but logic checks date)
        // We set it to expire at the end of the day or just 24h. 
        // Simple approach: standard cookie.
        response.cookies.set('last_booking', today, {
            path: '/',
            httpOnly: true, // not accessible by JS
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 1 day
        })

        return response

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء الحجز' },
            { status: 500 }
        )
    }
}
