import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, doubtId } = await request.json()

        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const supabase = await createClient()

        // Update payment status to 'held' (escrow)
        await supabase.from('payments')
            .update({
                gateway_payment_id: razorpay_payment_id,
                gateway_signature: razorpay_signature,
                status: 'held',
                updated_at: new Date().toISOString()
            })
            .eq('gateway_order_id', razorpay_order_id)

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('PAYMENT_VERIFY_ERROR', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
