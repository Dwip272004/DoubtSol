export type UserRole = 'student' | 'tutor' | 'admin'
export type DoubtStatus = 'open' | 'accepted' | 'solved' | 'expired' | 'cancelled'
export type PreferredMode = 'text' | 'call' | 'both'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type AnswerType = 'text' | 'call_recording'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'failed'
export type MessageType = 'text' | 'file' | 'system'

export interface Profile {
    id: string
    name: string
    email: string
    role: UserRole
    bio?: string
    avatar_url?: string
    subjects?: string[]
    rating: number
    total_reviews: number
    wallet_balance: number
    is_verified: boolean
    created_at: string
    updated_at: string
}

export interface Doubt {
    id: string
    student_id: string
    title: string
    description: string
    subject: string
    price: number
    status: DoubtStatus
    preferred_mode: PreferredMode
    accepted_tutor_id?: string
    tags?: string[]
    attachment_urls?: string[]
    created_at: string
    updated_at: string
    student?: Profile
    accepted_tutor?: Profile
    applications?: DoubtApplication[]
    payment?: Payment
}

export interface DoubtApplication {
    id: string
    doubt_id: string
    tutor_id: string
    message?: string
    status: ApplicationStatus
    created_at: string
    tutor?: Profile
}

export interface Answer {
    id: string
    doubt_id: string
    tutor_id: string
    type: AnswerType
    content?: string
    content_url?: string
    created_at: string
    tutor?: Profile
}

export interface Payment {
    id: string
    doubt_id: string
    student_id: string
    tutor_id?: string
    amount: number
    platform_fee: number
    gateway_order_id?: string
    gateway_payment_id?: string
    gateway_signature?: string
    status: PaymentStatus
    created_at: string
    updated_at: string
}

export interface Review {
    id: string
    doubt_id: string
    student_id: string
    tutor_id: string
    rating: number
    comment?: string
    created_at: string
    student?: Profile
}

export interface Message {
    id: string
    doubt_id: string
    sender_id: string
    content: string
    type: MessageType
    file_url?: string
    created_at: string
    sender?: Profile
}

export interface CallSession {
    id: string
    doubt_id: string
    room_name: string
    started_at?: string
    ended_at?: string
    recording_url?: string
    created_at: string
}
