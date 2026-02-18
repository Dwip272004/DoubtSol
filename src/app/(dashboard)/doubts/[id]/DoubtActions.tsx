'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, UserCheck, CreditCard, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
    doubtId: string
    applicationId?: string
    tutorId?: string
    amount?: number
    action: 'accept' | 'apply' | 'pay' | 'solve'
}

export default function DoubtActions({ doubtId, applicationId, tutorId, amount, action }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showApplyForm, setShowApplyForm] = useState(false)

    const handleAccept = async () => {
        setLoading(true)
        const supabase = createClient()
        // Accept application: update doubt + application status
        await supabase.from('doubts').update({ status: 'accepted', accepted_tutor_id: tutorId }).eq('id', doubtId)
        await supabase.from('doubt_applications').update({ status: 'accepted' }).eq('id', applicationId!)
        // Reject other applications
        await supabase.from('doubt_applications').update({ status: 'rejected' }).eq('doubt_id', doubtId).neq('id', applicationId!)
        setLoading(false)
        router.refresh()
    }

    const handleApply = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('doubt_applications').insert({ doubt_id: doubtId, tutor_id: user.id, message })
        setLoading(false)
        setShowApplyForm(false)
        router.refresh()
    }

    const handlePay = async () => {
        setLoading(true)
        // Create Razorpay order via API
        const res = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doubtId, amount }),
        })
        const { orderId, key } = await res.json()

        const options = {
            key,
            amount: (amount || 0) * 100,
            currency: 'INR',
            name: 'DoubtSolve',
            description: 'Doubt Payment',
            order_id: orderId,
            handler: async (response: any) => {
                await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...response, doubtId }),
                })
                router.refresh()
            },
            theme: { color: '#4a5eff' },
        }

        // @ts-ignore
        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
    }

    const handleSolve = async () => {
        setLoading(true)
        await fetch('/api/payment/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doubtId }),
        })
        const supabase = createClient()
        await supabase.from('doubts').update({ status: 'solved' }).eq('id', doubtId)
        setLoading(false)
        router.refresh()
    }

    if (action === 'accept') {
        return (
            <button onClick={handleAccept} disabled={loading} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                Accept
            </button>
        )
    }

    if (action === 'apply') {
        return showApplyForm ? (
            <div className="space-y-3">
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Introduce yourself and explain how you'll help..."
                    rows={3}
                    className="input-field resize-none text-sm"
                />
                <div className="flex gap-2">
                    <button onClick={handleApply} disabled={loading} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Submit Application
                    </button>
                    <button onClick={() => setShowApplyForm(false)} className="btn-secondary text-sm px-4">Cancel</button>
                </div>
            </div>
        ) : (
            <button onClick={() => setShowApplyForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Apply to Answer
            </button>
        )
    }

    if (action === 'pay') {
        return (
            <>
                <script src="https://checkout.razorpay.com/v1/checkout.js" />
                <button onClick={handlePay} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Pay & Activate Doubt
                </button>
            </>
        )
    }

    if (action === 'solve') {
        return (
            <button onClick={handleSolve} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-600/25">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Solved & Release Payment
            </button>
        )
    }

    return null
}
