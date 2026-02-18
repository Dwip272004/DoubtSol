'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, IndianRupee, BookOpen, Video, AlignLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SUBJECTS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(200),
    description: z.string().min(30, 'Please describe your doubt in at least 30 characters'),
    subject: z.string().min(1, 'Please select a subject'),
    price: z.number().min(10, 'Minimum price is ₹10').max(10000, 'Maximum price is ₹10,000'),
    preferred_mode: z.enum(['text', 'call', 'both']),
    tags: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const modes = [
    { value: 'text', label: 'Written Answer', icon: AlignLeft, desc: 'Get a detailed text explanation' },
    { value: 'call', label: 'Live Call', icon: Video, desc: 'Real-time video explanation' },
    { value: 'both', label: 'Either', icon: BookOpen, desc: 'Tutor chooses the best method' },
]

export default function PostDoubtPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { preferred_mode: 'both', price: 100 },
    })

    const selectedMode = watch('preferred_mode')
    const price = watch('price')

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []

        const { data: doubt, error: dbError } = await supabase
            .from('doubts')
            .insert({
                student_id: user.id,
                title: data.title,
                description: data.description,
                subject: data.subject,
                price: data.price,
                preferred_mode: data.preferred_mode,
                tags,
                status: 'open',
            })
            .select()
            .single()

        if (dbError) {
            setError(dbError.message)
            setLoading(false)
            return
        }

        // Redirect to payment or doubt page
        router.push(`/doubts/${doubt.id}?posted=true`)
    }

    const platformFee = Math.round((price || 0) * 0.15)
    const tutorEarns = (price || 0) - platformFee

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in">
            <div>
                <h1 className="text-3xl font-bold text-white">Post a Doubt</h1>
                <p className="text-white/50 mt-1">Describe your question clearly to attract the best tutors</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div className="card space-y-4">
                    <h2 className="font-semibold text-white">Doubt Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Question Title *</label>
                        <input
                            {...register('title')}
                            placeholder="e.g. How to solve quadratic equations using the quadratic formula?"
                            className="input-field"
                        />
                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Detailed Description *</label>
                        <textarea
                            {...register('description')}
                            rows={5}
                            placeholder="Explain your doubt in detail. Include what you've already tried, what's confusing you, and any relevant context..."
                            className="input-field resize-none"
                        />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Subject *</label>
                            <select {...register('subject')} className="input-field">
                                <option value="">Select subject</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Tags (optional)</label>
                            <input
                                {...register('tags')}
                                placeholder="algebra, formula, class 10"
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Mode */}
                <div className="card space-y-4">
                    <h2 className="font-semibold text-white">Preferred Answer Mode</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {modes.map((mode) => (
                            <button
                                key={mode.value}
                                type="button"
                                onClick={() => setValue('preferred_mode', mode.value as any)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200',
                                    selectedMode === mode.value
                                        ? 'border-brand-500 bg-brand-500/10 text-white'
                                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                )}
                            >
                                <mode.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{mode.label}</span>
                                <span className="text-xs opacity-70">{mode.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price */}
                <div className="card space-y-4">
                    <h2 className="font-semibold text-white">Set Your Price</h2>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Amount you&apos;re willing to pay *</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                min="10"
                                max="10000"
                                className="input-field pl-11"
                            />
                        </div>
                        {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-white/50">
                            <span>Your payment</span>
                            <span>₹{price || 0}</span>
                        </div>
                        <div className="flex justify-between text-white/50">
                            <span>Platform fee (15%)</span>
                            <span>- ₹{platformFee}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2">
                            <span>Tutor earns</span>
                            <span className="text-green-400">₹{tutorEarns}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                        <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <p className="text-sm text-brand-300">
                            Your payment is held in <strong>secure escrow</strong> and only released to the tutor after you mark the doubt as solved.
                        </p>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? 'Posting...' : 'Post Doubt & Proceed to Payment'}
                </button>
            </form>
        </div>
    )
}
