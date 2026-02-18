'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, cn } from '@/lib/utils'

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        let channel: any

        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch initial notifications
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
            setLoading(false)

            // Subscribe to real-time updates
            channel = supabase
                .channel(`notifications:${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                }, (payload: any) => {
                    setNotifications(prev => [payload.new, ...prev].slice(0, 10))
                    setUnreadCount(c => c + 1)
                })
                .subscribe()
        }

        setup()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [])

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(c => Math.max(0, c - 1))
    }

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
                <Bell className="w-5 h-5 text-white/70" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a14]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-3 w-80 bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-white/30 text-sm">No notifications yet</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group",
                                            !n.is_read && "bg-brand-500/5"
                                        )}
                                    >
                                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest leading-none">{n.type}</span>
                                            <span className="text-[10px] text-white/20">{formatRelativeTime(n.created_at)}</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white mb-1">{n.title}</h4>
                                        <p className="text-xs text-white/50 leading-relaxed mb-3">{n.message}</p>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={n.link}
                                                onClick={() => {
                                                    markAsRead(n.id)
                                                    setShowDropdown(false)
                                                }}
                                                className="text-xs text-white/70 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md"
                                            >
                                                <ExternalLink className="w-3 h-3" /> View details
                                            </Link>
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-xs text-white/30 hover:text-white/60"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link
                            href="/dashboard/notifications"
                            className="block p-3 text-center text-xs text-white/30 hover:text-white/60 bg-black/20"
                            onClick={() => setShowDropdown(false)}
                        >
                            See all notifications
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
