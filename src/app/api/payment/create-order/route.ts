import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { doubtId, amount } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        })

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            receipt: `rcpt_${doubtId}`,
            notes: {
                doubtId: doubtId,
                studentId: user.id
            }
        })

        // Store pending payment in DB
        await supabase.from('payments').insert({
            doubt_id: doubtId,
            student_id: user.id,
            amount: amount,
            gateway_order_id: order.id,
            status: 'pending'
        })

        return NextResponse.json({
            orderId: order.id,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        })

    } catch (error: any) {
        console.error('RAZORPAY_ERROR', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
