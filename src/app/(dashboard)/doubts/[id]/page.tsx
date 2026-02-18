import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatCurrency, formatDate, formatRelativeTime, STATUS_COLORS, MODE_LABELS } from '@/lib/utils'
import { Clock, User, IndianRupee, MessageSquare, Video, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DoubtActions from './DoubtActions'
import AnswerForm from './AnswerForm'
import { cn } from '@/lib/utils'

interface PageProps {
    params: { id: string }
    searchParams: { posted?: string }
}

export default async function DoubtDetailPage({ params, searchParams }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: doubt } = await supabase
        .from('doubts')
        .select(`
      *,
      student:profiles!doubts_student_id_fkey(id, name, avatar_url, rating, total_reviews),
      accepted_tutor:profiles!doubts_accepted_tutor_id_fkey(id, name, avatar_url, rating, total_reviews),
      doubt_applications(*, tutor:profiles(id, name, avatar_url, rating, total_reviews, bio, subjects)),
      answers(*),
      payments(*)
    `)
        .eq('id', params.id)
        .single()

    if (!doubt) notFound()

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isStudent = user.id === doubt.student_id
    const isTutor = profile?.role === 'tutor'
    const isAcceptedTutor = user.id === doubt.accepted_tutor_id
    const hasApplied = doubt.doubt_applications?.some((a: any) => a.tutor_id === user.id)

    const payment = doubt.payments?.[0]
    const answer = doubt.answers?.[0]

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in">
            {/* Back */}
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Link>

            {/* Posted success banner */}
            {searchParams.posted && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                        <p className="text-green-300 font-medium">Doubt posted successfully!</p>
                        <p className="text-green-400/70 text-sm">Complete payment to activate your doubt and attract tutors.</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Doubt card */}
                    <div className="card">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                    <span className={`badge ${STATUS_COLORS[doubt.status]}`}>{doubt.status}</span>
                                    <span className="badge bg-white/5 text-white/50 border-white/10">{doubt.subject}</span>
                                    <span className="badge bg-white/5 text-white/50 border-white/10">{MODE_LABELS[doubt.preferred_mode]}</span>
                                </div>
                                <h1 className="text-2xl font-bold text-white">{doubt.title}</h1>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-3xl font-bold text-accent-400">{formatCurrency(doubt.price)}</div>
                                <div className="text-white/30 text-xs mt-1">Prize money</div>
                            </div>
                        </div>

                        <p className="text-white/60 leading-relaxed whitespace-pre-wrap">{doubt.description}</p>

                        {doubt.tags && doubt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {doubt.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/40">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-sm text-white/30">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Posted {formatRelativeTime(doubt.created_at)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                {doubt.student?.name}
                            </span>
                        </div>
                    </div>

                    {/* Answer section */}
                    {answer ? (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                Solution
                            </h2>
                            {answer.type === 'text' ? (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{answer.content}</p>
                                </div>
                            ) : (
                                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                                    <Video className="w-8 h-8 text-brand-400" />
                                    <div>
                                        <p className="text-white font-medium">Call Recording</p>
                                        <a href={answer.content_url} target="_blank" rel="noopener noreferrer" className="text-brand-400 text-sm hover:underline">Watch recording</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        isAcceptedTutor && doubt.status === 'accepted' && (
                            <AnswerForm doubtId={doubt.id} tutorId={user.id} />
                        )
                    )}

                    {/* Applications (student view) */}
                    {isStudent && doubt.doubt_applications && doubt.doubt_applications.length > 0 && doubt.status === 'open' && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Tutor Applications ({doubt.doubt_applications.length})
                            </h2>
                            <div className="space-y-4">
                                {doubt.doubt_applications.map((app: any) => (
                                    <div key={app.id} className="bg-white/5 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                                    {app.tutor?.name?.[0] || 'T'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{app.tutor?.name}</p>
                                                    <p className="text-white/40 text-xs">★ {app.tutor?.rating?.toFixed(1) || 'New'} · {app.tutor?.total_reviews || 0} reviews</p>
                                                </div>
                                            </div>
                                            <DoubtActions doubtId={doubt.id} applicationId={app.id} tutorId={app.tutor_id} action="accept" />
                                        </div>
                                        {app.message && <p className="text-white/50 text-sm mt-3 pl-13">{app.message}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Payment status */}
                    <div className="card">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-accent-400" />
                            Payment
                        </h3>
                        {payment ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/40">Amount</span>
                                    <span className="text-white font-medium">{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Status</span>
                                    <span className={`font-medium ${payment.status === 'held' ? 'text-yellow-400' : payment.status === 'released' ? 'text-green-400' : 'text-white/60'}`}>
                                        {payment.status}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-white/40 text-sm mb-3">Payment not yet completed</p>
                                {isStudent && <DoubtActions doubtId={doubt.id} amount={doubt.price} action="pay" />}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="card space-y-3">
                        <h3 className="font-semibold text-white">Actions</h3>
                        {/* Tutor: Apply */}
                        {isTutor && !isAcceptedTutor && doubt.status === 'open' && !hasApplied && (
                            <DoubtActions doubtId={doubt.id} action="apply" />
                        )}
                        {isTutor && hasApplied && (
                            <div className="text-center py-2 text-white/40 text-sm">Application sent ✓</div>
                        )}
                        {/* Join call */}
                        {(isStudent || isAcceptedTutor) && doubt.status === 'accepted' && doubt.preferred_mode !== 'text' && (
                            <Link href={`/call/${doubt.id}`} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Video className="w-4 h-4" /> Join Live Call
                            </Link>
                        )}
                        {/* Student: Mark solved */}
                        {isStudent && doubt.status === 'accepted' && answer && (
                            <DoubtActions doubtId={doubt.id} action="solve" />
                        )}
                        {/* Chat */}
                        {(isStudent || isAcceptedTutor) && doubt.status !== 'open' && (
                            <Link href={`/doubts/${doubt.id}/chat`} className="btn-secondary w-full flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Open Chat
                            </Link>
                        )}
                    </div>

                    {/* Tutor info */}
                    {doubt.accepted_tutor && (
                        <div className="card">
                            <h3 className="font-semibold text-white mb-3">Assigned Tutor</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
                                    {doubt.accepted_tutor.name?.[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{doubt.accepted_tutor.name}</p>
                                    <p className="text-white/40 text-sm">★ {doubt.accepted_tutor.rating?.toFixed(1) || 'New'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
