import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Filter, BookOpen, Clock, ArrowRight, Star } from 'lucide-react'
import { formatCurrency, formatRelativeTime, STATUS_COLORS, MODE_LABELS, SUBJECTS } from '@/lib/utils'
import { Doubt } from '@/types'

interface PageProps {
    searchParams: { subject?: string; mode?: string; min?: string; max?: string; q?: string }
}

export default async function MarketplacePage({ searchParams }: PageProps) {
    const supabase = await createClient()

    let query = supabase
        .from('doubts')
        .select('*, student:profiles!doubts_student_id_fkey(id, name, avatar_url, rating)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

    if (searchParams.subject) query = query.eq('subject', searchParams.subject)
    if (searchParams.mode) query = query.eq('preferred_mode', searchParams.mode)
    if (searchParams.min) query = query.gte('price', parseFloat(searchParams.min))
    if (searchParams.max) query = query.lte('price', parseFloat(searchParams.max))
    if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

    const { data: doubts } = await query.limit(50)

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Doubt Marketplace</h1>
                <p className="text-white/50 mt-1">Browse open doubts and help students learn</p>
            </div>

            {/* Search & Filters */}
            <div className="card">
                <form className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            name="q"
                            defaultValue={searchParams.q}
                            placeholder="Search doubts..."
                            className="input-field pl-11"
                        />
                    </div>
                    <select name="subject" defaultValue={searchParams.subject} className="input-field md:w-48">
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="mode" defaultValue={searchParams.mode} className="input-field md:w-44">
                        <option value="">Any Mode</option>
                        <option value="text">Written Answer</option>
                        <option value="call">Live Call</option>
                        <option value="both">Text or Call</option>
                    </select>
                    <button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </form>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-white/50 text-sm">
                    {doubts?.length || 0} open doubts found
                </p>
                {searchParams.subject && (
                    <Link href="/marketplace" className="text-sm text-brand-400 hover:text-brand-300">
                        Clear filters
                    </Link>
                )}
            </div>

            {/* Doubt Cards */}
            {doubts && doubts.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {doubts.map((doubt: any) => (
                        <Link key={doubt.id} href={`/doubts/${doubt.id}`} className="card glass-hover group cursor-pointer flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`badge ${STATUS_COLORS[doubt.status]}`}>{doubt.status}</span>
                                        <span className="badge bg-white/5 text-white/50 border-white/10">{doubt.subject}</span>
                                    </div>
                                    <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                                        {doubt.title}
                                    </h3>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-xl font-bold text-accent-400">{formatCurrency(doubt.price)}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-white/40 text-sm line-clamp-2 mb-4 flex-1">
                                {doubt.description}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                        {doubt.student?.name?.[0] || 'S'}
                                    </div>
                                    <span className="text-white/40 text-xs">{doubt.student?.name || 'Student'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-white/30">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatRelativeTime(doubt.created_at)}
                                    </span>
                                    <span className="text-brand-400 font-medium">{MODE_LABELS[doubt.preferred_mode]}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-16">
                    <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/50 mb-2">No doubts found</h3>
                    <p className="text-white/30">Try adjusting your filters or check back later.</p>
                </div>
            )}
        </div>
    )
}
