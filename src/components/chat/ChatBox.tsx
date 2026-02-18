'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, FileIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { Message } from '@/types'

interface Props {
    doubtId: string
    currentUserId: string
}

export default function ChatBox({ doubtId, currentUserId }: Props) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        // 1. Fetch existing messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*, sender:profiles(id, name, avatar_url)')
                .eq('doubt_id', doubtId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data as any)
            setLoading(false)
        }

        fetchMessages()

        // 2. Subscribe to new messages
        const channel = supabase
            .channel(`doubt:${doubtId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `doubt_id=eq.${doubtId}`,
            }, async (payload) => {
                // Fetch sender info for the new message
                const { data: sender } = await supabase
                    .from('profiles')
                    .select('id, name, avatar_url')
                    .eq('id', payload.new.sender_id)
                    .single()

                const fullMessage = { ...payload.new, sender } as Message
                setMessages(prev => [...prev, fullMessage])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [doubtId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const messageToSend = newMessage
        setNewMessage('')

        await supabase.from('messages').insert({
            doubt_id: doubtId,
            sender_id: currentUserId,
            content: messageToSend,
            type: 'text'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[500px] border border-white/5 rounded-2xl bg-black/20 overflow-hidden">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 text-sm">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {!isMe && <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{msg.sender?.name}</span>}
                                    <span className="text-[10px] text-white/20">{formatRelativeTime(msg.created_at)}</span>
                                </div>
                                <div className={`max-w-[80%] px-4 py-2 ${isMe ? 'bg-brand-600 text-white rounded-2xl rounded-tr-none' : 'bg-white/5 text-white/80 rounded-2xl rounded-tl-none border border-white/5'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="input-field pr-12"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
