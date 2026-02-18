'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Loader2, GraduationCap, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'tutor']),
})

type FormData = z.infer<typeof schema>

import { Suspense } from 'react'

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultRole = (searchParams.get('role') as 'student' | 'tutor') || 'student'

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: defaultRole },
    })

    const selectedRole = watch('role')

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { name: data.name, role: data.role },
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="relative w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">DoubtSolve</span>
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                <p className="text-white/50">Join thousands of students and tutors</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'student', label: 'Student', icon: GraduationCap, desc: 'I want to clear doubts' },
                                { value: 'tutor', label: 'Tutor', icon: BookOpen, desc: 'I want to answer doubts' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setValue('role', option.value as 'student' | 'tutor')}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                                        selectedRole === option.value
                                            ? 'border-brand-500 bg-brand-500/10 text-white'
                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                    )}
                                >
                                    <option.icon className="w-6 h-6" />
                                    <span className="font-semibold text-sm">{option.label}</span>
                                    <span className="text-xs text-center opacity-70">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
                        <input {...register('name')} type="text" placeholder="John Doe" className="input-field" id="name" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                        <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" id="signup-email" />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                className="input-field pr-12"
                                id="signup-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-white/40 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4 py-12">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading...</p>
                </div>
            }>
                <SignupForm />
            </Suspense>
        </div>
    )
}
