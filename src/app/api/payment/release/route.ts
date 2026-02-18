import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { doubtId } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is the student who posted the doubt
        const { data: doubt } = await supabase
            .from('doubts')
            .select('student_id, accepted_tutor_id, price')
            .eq('id', doubtId)
            .single()

        if (!doubt || doubt.student_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized or doubt not found' }, { status: 403 })
        }

        if (!doubt.accepted_tutor_id) {
            return NextResponse.json({ error: 'No tutor accepted for this doubt' }, { status: 400 })
        }

        // 1. Update payment status to 'released'
        await supabase.from('payments')
            .update({ status: 'released' })
            .eq('doubt_id', doubtId)
            .eq('status', 'held')

        // 2. Update tutor's wallet balance
        // Calculate platform fee (15%)
        const platformFee = doubt.price * 0.15
        const tutorAmount = doubt.price - platformFee

        // We use a database function for atomicity in a real app, 
        // but for MVP we can do it here or via a Supabase Edge Function/RPC.
        const { data: tutorProfile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', doubt.accepted_tutor_id)
            .single()

        const newBalance = Number(tutorProfile?.wallet_balance || 0) + tutorAmount

        await supabase.from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', doubt.accepted_tutor_id)

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('RELEASE_ESCROW_ERROR', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
