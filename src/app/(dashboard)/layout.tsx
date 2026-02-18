'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Search, PlusCircle, User, Wallet,
    LogOut, Zap, Menu, X, Bell
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/marketplace', label: 'Marketplace', icon: Search },
    { href: '/post-doubt', label: 'Post Doubt', icon: PlusCircle },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#0a0a14] flex">
            {/* Sidebar */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-50 w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">DoubtSolve</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign out */}
                <div className="px-3 py-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                        </button>
                        <Link href="/profile" className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            U
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
