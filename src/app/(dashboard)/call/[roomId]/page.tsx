import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import VideoRoom from '@/components/call/VideoRoom'
import { ArrowLeft, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: { roomId: string }
}

export default async function CallRoomPage({ params }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: doubt } = await supabase
        .from('doubts')
        .select('title, status, student_id, accepted_tutor_id, subject')
        .eq('id', params.roomId)
        .single()

    if (!doubt) notFound()

    // Verify access
    if (doubt.student_id !== user.id && doubt.accepted_tutor_id !== user.id) {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/doubts/${params.roomId}`} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/40" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Live Explanation Room</h1>
                        <div className="flex items-center gap-3 text-sm text-white/40">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {doubt.subject}</span>
                            <span>•</span>
                            <span className="font-medium text-white/60">{doubt.title}</span>
                        </div>
                    </div>
                </div>
            </div>

            <VideoRoom roomId={params.roomId} doubtTitle={doubt.title} />

            <div className="card bg-brand-500/5 border-brand-500/10 flex items-start gap-4 p-5">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white mb-1">Session Guidelines</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                        Recordings are automatically saved to the doubt section once both participants leave.
                        Be respectful and focused on the doubt. If you face connectivity issues, try refreshing this page.
                    </p>
                </div>
            </div>
        </div>
    )
}
