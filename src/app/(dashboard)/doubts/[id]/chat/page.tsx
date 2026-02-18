import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatBox from '@/components/chat/ChatBox'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: { id: string }
}

export default async function DoubtChatPage({ params }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: doubt } = await supabase
        .from('doubts')
        .select('title, student_id, accepted_tutor_id')
        .eq('id', params.id)
        .single()

    if (!doubt) notFound()

    // Verify access (only student or accepted tutor)
    if (doubt.student_id !== user.id && doubt.accepted_tutor_id !== user.id) {
        redirect('/dashboard')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in">
            <div className="flex items-center gap-4">
                <Link href={`/doubts/${params.id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white/40" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-brand-400" /> Discussion
                    </h1>
                    <p className="text-sm text-white/40 truncate max-w-md">{doubt.title}</p>
                </div>
            </div>

            <ChatBox doubtId={params.id} currentUserId={user.id} />

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-white/30 text-center">
                    Discussion is monitored for quality and security. Payments are released only when the student marks the doubt as solved.
                </p>
            </div>
        </div>
    )
}
