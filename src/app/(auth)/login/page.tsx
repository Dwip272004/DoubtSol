'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
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
        <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">DoubtSolve</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-white/50">Sign in to your account to continue</p>
                </div>

                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className="input-field"
                                id="email"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-white/70">Password</label>
                                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pr-12"
                                    id="password"
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
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
