import Link from 'next/link'
import { BookOpen, Video, Shield, Star, ArrowRight, CheckCircle, Zap, Users } from 'lucide-react'

const features = [
    {
        icon: BookOpen,
        title: 'Post Your Doubt',
        description: 'Describe your question, set a price you\'re willing to pay, and choose text or live call.',
        color: 'from-brand-500 to-brand-600',
    },
    {
        icon: Users,
        title: 'Expert Tutors Apply',
        description: 'Verified tutors browse your doubt and apply. You choose the best fit.',
        color: 'from-purple-500 to-purple-600',
    },
    {
        icon: Shield,
        title: 'Secure Escrow Payment',
        description: 'Your payment is held safely in escrow and only released when you\'re satisfied.',
        color: 'from-accent-500 to-accent-600',
    },
    {
        icon: Video,
        title: 'Live Video Calls',
        description: 'Join a live WebRTC session with your tutor for real-time explanation.',
        color: 'from-green-500 to-green-600',
    },
]

const stats = [
    { value: '10,000+', label: 'Doubts Solved' },
    { value: '2,500+', label: 'Expert Tutors' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '₹50L+', label: 'Paid to Tutors' },
]

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'English', 'History']

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0a14] overflow-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent-600/10 rounded-full blur-3xl" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">DoubtSolve</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/marketplace" className="text-white/60 hover:text-white transition-colors text-sm">Browse Doubts</Link>
                            <Link href="#features" className="text-white/60 hover:text-white transition-colors text-sm">How it Works</Link>
                            <Link href="#subjects" className="text-white/60 hover:text-white transition-colors text-sm">Subjects</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
                            <Link href="/signup" className="btn-primary text-sm">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 pt-24 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 mb-8 animate-in">
                        <Star className="w-4 h-4 fill-brand-400 text-brand-400" />
                        <span>India&apos;s #1 Paid Doubt Clearance Platform</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-in">
                        Clear Your Doubts{' '}
                        <span className="text-gradient">Instantly</span>
                        <br />with Expert Tutors
                    </h1>

                    <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Post any academic doubt, set your price, and get expert answers via text or live video call.
                        Pay only when you&apos;re satisfied.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link href="/signup?role=student" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                            Post a Doubt <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/signup?role=tutor" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                            Become a Tutor
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="glass rounded-2xl p-5">
                                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                                <div className="text-sm text-white/50">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How DoubtSolve Works</h2>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">A simple, secure, and effective way to get your doubts cleared by verified experts.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div key={feature.title} className="card glass-hover group cursor-default">
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-xs text-white/30 font-mono mb-2">0{i + 1}</div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subjects */}
            <section id="subjects" className="relative z-10 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">All Subjects Covered</h2>
                        <p className="text-white/50">From school to college, we have experts for every subject.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {subjects.map((subject) => (
                            <Link
                                key={subject}
                                href={`/marketplace?subject=${subject}`}
                                className="glass glass-hover px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-brand-500/50 transition-all duration-200"
                            >
                                {subject}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="card glow-brand">
                        <h2 className="text-4xl font-bold mb-4">Ready to Clear Your Doubts?</h2>
                        <p className="text-white/60 mb-8 text-lg">Join thousands of students getting expert help every day.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup?role=student" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
                                Post Your First Doubt <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/marketplace" className="btn-secondary text-base px-8 py-3.5">
                                Browse Marketplace
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/40">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Secure Payments</span>
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified Tutors</span>
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Money-back Guarantee</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-md flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold text-white">DoubtSolve</span>
                    </div>
                    <p className="text-white/30 text-sm">© 2026 DoubtSolve. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-white/40">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
