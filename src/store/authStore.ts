'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/types'

interface AuthState {
    profile: Profile | null
    setProfile: (profile: Profile | null) => void
    clearProfile: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            profile: null,
            setProfile: (profile) => set({ profile }),
            clearProfile: () => set({ profile: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
