import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    ClipboardList,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    MessageSquare,
    User
} from 'lucide-react'
import Link from 'next/link'
import DoubtActions from '../doubts/[id]/DoubtActions'
import { cn } from '@/lib/utils'

export default async function ApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const isStudent = profile?.role === 'student'

    let applications = []

    if (isStudent) {
        // For students: Get all doubts they posted, along with applications for those doubts
        const { data } = await supabase
            .from('doubts')
            .select(`
                id,
                title,
                status,
                price,
                subject,
                created_at,
                doubt_applications (
                    id,
                    tutor_id,
                    message,
                    status,
                    created_at,
                    profiles (
                        name,
                        rating,
                        total_reviews
                    )
                )
            `)
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })

        applications = data || []
    } else {
        // For tutors: Get all applications they've sent
        const { data } = await supabase
            .from('doubt_applications')
            .select(`
                id,
                message,
                status,
                created_at,
                doubts (
                    id,
                    title,
                    price,
                    subject,
                    status,
                    profiles:student_id (
                        name
                    )
                )
            `)
            .eq('tutor_id', user.id)
            .order('created_at', { ascending: false })

        applications = data || []
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-brand-500" />
                        Applications
                    </h1>
                    <p className="text-white/50">
                        {isStudent
                            ? "Manage tutors who have applied to solve your doubts."
                            : "Track the status of the doubts you've applied to answer."}
                    </p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="card py-16 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <ClipboardList className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto">
                        {isStudent
                            ? "When tutors apply to your doubts, they will appear here."
                            : "Start applying to doubts in the marketplace to see them here."}
                    </p>
                    <Link
                        href={isStudent ? "/post-doubt" : "/marketplace"}
                        className="btn-primary"
                    >
                        {isStudent ? "Post a Doubt" : "Browse Marketplace"}
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {isStudent ? (
                        // Student View: Doubts with nested applications
                        applications.map((doubt: any) => (
                            <div key={doubt.id} className="card overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                {doubt.subject}
                                            </span>
                                            <h3 className="text-lg font-bold text-white tracking-tight">{doubt.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-none mb-1">Status</p>
                                                <span className={cn(
                                                    "text-sm font-semibold",
                                                    doubt.status === 'open' ? "text-blue-400" :
                                                        doubt.status === 'accepted' ? "text-yellow-400" :
                                                            doubt.status === 'solved' ? "text-green-400" : "text-white/40"
                                                )}>
                                                    {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="w-px h-8 bg-white/5" />
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-none mb-1">Offer</p>
                                                <span className="text-sm font-bold text-white">₹{doubt.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/doubts/${doubt.id}`}
                                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 w-fit"
                                    >
                                        View Doubt Details <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {doubt.doubt_applications.length === 0 ? (
                                        <div className="p-8 text-center text-white/30 text-sm italic">
                                            No applications received for this doubt yet.
                                        </div>
                                    ) : (
                                        doubt.doubt_applications.map((app: any) => (
                                            <div key={app.id} className="p-6 hover:bg-white/[0.01] transition-colors">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/10">
                                                                {app.profiles.name[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white leading-none mb-1">{app.profiles.name}</h4>
                                                                <div className="flex items-center gap-2 text-xs text-white/40">
                                                                    <span className="flex items-center gap-1 text-yellow-500/80">
                                                                        ★ {Number(app.profiles.rating).toFixed(1)}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{app.profiles.total_reviews} reviews</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {app.message && (
                                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                                <p className="text-sm text-white/70 leading-relaxed italic">
                                                                    "{app.message}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[140px]">
                                                        {app.status === 'pending' && doubt.status === 'open' ? (
                                                            <DoubtActions
                                                                action="accept"
                                                                doubtId={doubt.id}
                                                                applicationId={app.id}
                                                                tutorId={app.tutor_id}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                                                {app.status === 'accepted' ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                                ) : app.status === 'rejected' ? (
                                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                                )}
                                                                <span className={cn(
                                                                    "text-xs font-bold uppercase tracking-wider",
                                                                    app.status === 'accepted' ? "text-green-400" :
                                                                        app.status === 'rejected' ? "text-red-400" : "text-yellow-400"
                                                                )}>
                                                                    {app.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-white/20 uppercase tracking-widest">
                                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Tutor View: Simple list of applications sent
                        applications.map((app: any) => (
                            <div key={app.id} className="card p-6 hover:border-brand-500/30 transition-all group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/50 border border-white/5 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors">
                                                    {app.doubts.subject}
                                                </span>
                                                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors uppercase tracking-tight">
                                                    {app.doubts.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                                {app.status === 'accepted' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                ) : app.status === 'rejected' ? (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                )}
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider",
                                                    app.status === 'accepted' ? "text-green-400" :
                                                        app.status === 'rejected' ? "text-red-400" : "text-yellow-400"
                                                )}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-4 h-4" />
                                                <span>Posted by <span className="text-white/60">{app.doubts.profiles.name}</span></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-brand-400 font-bold">₹{app.doubts.price}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Your Message</p>
                                            <p className="text-sm text-white/70 italic line-clamp-2">
                                                "{app.message || "No message provided."}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-end gap-3 min-w-[140px]">
                                        <Link
                                            href={`/doubts/${app.doubts.id}`}
                                            className="btn-secondary w-full text-center text-sm"
                                        >
                                            View Doubt
                                        </Link>
                                        {app.status === 'accepted' && (
                                            <Link
                                                href={`/doubts/${app.doubts.id}/chat`}
                                                className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Start Chat
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
