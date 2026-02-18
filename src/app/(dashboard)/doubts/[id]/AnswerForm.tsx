'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, Send } from 'lucide-react'

interface Props {
    doubtId: string
    tutorId: string
}

export default function AnswerForm({ doubtId, tutorId }: Props) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        const { error } = await supabase
            .from('answers')
            .insert({
                doubt_id: doubtId,
                tutor_id: tutorId,
                type: 'text',
                content: content
            })

        if (!error) {
            await supabase.from('doubts').update({ status: 'answered' }).eq('id', doubtId)
            setSubmitted(true)
            router.refresh()
        }
        setLoading(false)
    }

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Answer Submitted!</h3>
                <p className="text-white/40 text-sm">Waiting for the student to review and release payment.</p>
            </div>
        )
    }

    return (
        <div className="card space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-400" /> Submit Your Solution
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/40 mb-2">Detailed Answer</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your detailed solution here..."
                        rows={8}
                        className="input-field resize-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Finalize Answer
                </button>
            </form>
        </div>
    )
}
