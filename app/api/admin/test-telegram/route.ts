import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(request: Request) {
    try {
        // Simple security check: verify origin or referer
        const referer = request.headers.get('referer')
        if (!referer || !referer.includes('/admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return NextResponse.json(
                { error: 'Telegram credentials not configured' },
                { status: 500 }
            )
        }

        const { message } = await request.json()

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        })

        const result = await response.json()

        if (!result.ok) {
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        )
    }
}
