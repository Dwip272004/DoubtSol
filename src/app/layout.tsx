import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'DoubtSolve — Get Your Doubts Answered by Expert Tutors',
    description: 'Post your academic doubts, set a price, and get expert answers via text or live video call. The fastest way to clear your doubts.',
    keywords: ['doubt solving', 'tutoring', 'online tutoring', 'homework help', 'academic help'],
    openGraph: {
        title: 'DoubtSolve — Expert Doubt Clearance Platform',
        description: 'Post doubts, pay securely, get expert answers.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-[#0a0a14]">
                {children}
            </body>
        </html>
    )
}
