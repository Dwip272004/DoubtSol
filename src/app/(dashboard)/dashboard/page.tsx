import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Clock, CheckCircle, DollarSign, TrendingUp, Star, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatRelativeTime, STATUS_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const isStudent = profile?.role === 'student'
    const isTutor = profile?.role === 'tutor'

    // Fetch recent doubts
    const { data: doubts } = isStudent
        ? await supabase.from('doubts').select('*, accepted_tutor:profiles!doubts_accepted_tutor_id_fkey(name, avatar_url)').eq('student_id', user.id).order('created_at', { ascending: false }).limit(5)
        : await supabase.from('doubts').select('*, student:profiles!doubts_student_id_fkey(name, avatar_url)').eq('accepted_tutor_id', user.id).order('created_at', { ascending: false }).limit(5)

    // Stats
    const { count: openCount } = await supabase.from('doubts').select('*', { count: 'exact', head: true }).eq(isStudent ? 'student_id' : 'accepted_tutor_id', user.id).eq('status', 'open')
    const { count: solvedCount } = await supabase.from('doubts').select('*', { count: 'exact', head: true }).eq(isStudent ? 'student_id' : 'accepted_tutor_id', user.id).eq('status', 'solved')

    const stats = isStudent
        ? [
            { label: 'Open Doubts', value: openCount || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Solved Doubts', value: solvedCount || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Spent', value: formatCurrency(0), icon: DollarSign, color: 'text-accent-400', bg: 'bg-accent-500/10' },
            { label: 'Wallet Balance', value: formatCurrency(profile?.wallet_balance || 0), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ]
        : [
            { label: 'Active Sessions', value: openCount || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Solved', value: solvedCount || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Rating', value: `${profile?.rating?.toFixed(1) || '—'} ★`, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Wallet Balance', value: formatCurrency(profile?.wallet_balance || 0), icon: DollarSign, color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ]

    return (
        <div className="space-y-8 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, {profile?.name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p className="text-white/50 mt-1">
                        {isStudent ? 'Manage your doubts and track your learning progress.' : 'Browse new doubts and manage your sessions.'}
                    </p>
                </div>
                {isStudent && (
                    <Link href="/post-doubt" className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Post Doubt
                    </Link>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-white/40">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Doubts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                        {isStudent ? 'Your Recent Doubts' : 'Your Active Sessions'}
                    </h2>
                    <Link href={isStudent ? '/doubts' : '/marketplace'} className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {doubts && doubts.length > 0 ? (
                    <div className="space-y-3">
                        {doubts.map((doubt: any) => (
                            <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="card glass-hover flex items-center gap-4 cursor-pointer">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`badge ${STATUS_COLORS[doubt.status]}`}>
                                            {doubt.status}
                                        </span>
                                        <span className="text-white/30 text-xs">{doubt.subject}</span>
                                    </div>
                                    <h3 className="font-medium text-white truncate">{doubt.title}</h3>
                                    <p className="text-white/40 text-sm mt-0.5">{formatRelativeTime(doubt.created_at)}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-accent-400 font-semibold">{formatCurrency(doubt.price)}</div>
                                    <ArrowRight className="w-4 h-4 text-white/20 ml-auto mt-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 mb-4">
                            {isStudent ? "You haven't posted any doubts yet." : "You haven't accepted any doubts yet."}
                        </p>
                        <Link href={isStudent ? '/post-doubt' : '/marketplace'} className="btn-primary inline-flex items-center gap-2">
                            {isStudent ? <><Plus className="w-4 h-4" /> Post Your First Doubt</> : <><Search className="w-4 h-4" /> Browse Marketplace</>}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

function Search(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
}
