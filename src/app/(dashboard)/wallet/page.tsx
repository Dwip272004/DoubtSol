import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, IndianRupee, PieChart, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function WalletPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance, role')
        .eq('id', user.id)
        .single()

    // Fetch recent payments/transactions
    const { data: payments } = await supabase
        .from('payments')
        .select('*, doubt:doubts(title)')
        .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

    const isTutor = profile?.role === 'tutor'

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in">
            <div>
                <h1 className="text-3xl font-bold text-white">My Wallet</h1>
                <p className="text-white/50 mt-1">Manage your funds, payouts, and view transaction history.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="md:col-span-2 card bg-gradient-to-br from-brand-600 to-brand-800 border-none flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/70 font-medium mb-1">Available Balance</p>
                        <div className="text-5xl font-extrabold text-white mb-6">
                            {formatCurrency(profile?.wallet_balance || 0)}
                        </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        {isTutor ? (
                            <button className="btn-secondary bg-white/20 border-white/10 hover:bg-white/30 text-white flex-1 flex items-center justify-center gap-2">
                                <ArrowDownCircle className="w-4 h-4" /> Withdraw Funds
                            </button>
                        ) : (
                            <button className="btn-secondary bg-white/20 border-white/10 hover:bg-white/30 text-white flex-1 flex items-center justify-center gap-2">
                                <ArrowUpCircle className="w-4 h-4" /> Add Money
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <div className="card h-full flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase font-bold tracking-wider">Total Earned</p>
                                <p className="text-xl font-bold text-white">{formatCurrency(0)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <PieChart className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase font-bold tracking-wider">Pending Escrow</p>
                                <p className="text-xl font-bold text-white">{formatCurrency(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                <div className="card p-0 overflow-hidden">
                    {payments && payments.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {payments.map((tx: any) => {
                                const isDebit = tx.student_id === user.id
                                return (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDebit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                {isDebit ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{tx.doubt?.title || 'Doubt Payment'}</p>
                                                <p className="text-white/40 text-xs">{formatDate(tx.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isDebit ? 'text-white' : 'text-green-400'}`}>
                                                {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                                            </p>
                                            <div className="flex items-center gap-1 justify-end text-[10px] uppercase font-bold tracking-widest mt-1">
                                                {tx.status === 'held' && <><Clock className="w-2.5 h-2.5 text-yellow-500" /> <span className="text-yellow-500">Escrow Held</span></>}
                                                {tx.status === 'released' && <><CheckCircle className="w-2.5 h-2.5 text-green-500" /> <span className="text-green-500">Completed</span></>}
                                                {tx.status === 'pending' && <><Clock className="w-2.5 h-2.5 text-white/30" /> <span className="text-white/30">Pending</span></>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <IndianRupee className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30">No transactions yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
