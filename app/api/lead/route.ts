import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, name, phone, offer_title, status } = body

        // Insert into Supabase
        const { data, error } = await supabase
            .from('offer_leads')
            .insert([
                {
                    id,
                    name,
                    phone,
                    offer_title,
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
            const telegramMessage = `🎁 <b>طلب عرض جديد!</b>

👤 <b>الاسم:</b> ${name}
📱 <b>الموبايل:</b> ${phone}
🚙 <b>الموديل المختار:</b> ${offer_title}

🔗 <a href="https://hazemopel.com/admin">فتح لوحة التحكم</a>`

            try {
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: telegramMessage,
                        parse_mode: 'HTML',
                    }),
                })
            } catch (err) {
                console.error('Telegram lead notification failed:', err)
            }
        }

        return NextResponse.json({ success: true, lead: data })

    } catch (error: any) {
        console.error('Lead submission error:', error)
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء حفظ البيانات' },
            { status: 500 }
        )
    }
}
