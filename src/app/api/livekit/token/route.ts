import { AccessToken } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const roomId = searchParams.get('room')

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!roomId) {
            return NextResponse.json({ error: 'Missing room' }, { status: 400 })
        }

        // Verify user is participant in this doubt
        const { data: doubt } = await supabase
            .from('doubts')
            .select('student_id, accepted_tutor_id')
            .eq('id', roomId)
            .single()

        if (!doubt || (doubt.student_id !== user.id && doubt.accepted_tutor_id !== user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()

        const apiKey = process.env.LIVEKIT_API_KEY
        const apiSecret = process.env.LIVEKIT_API_SECRET
        const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

        if (!apiKey || !apiSecret || !wsUrl) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: user.id,
            name: profile?.name || 'User',
        })

        at.addGrant({ roomJoin: true, room: roomId, canPublish: true, canSubscribe: true })

        return NextResponse.json({ token: await at.toJwt() })

    } catch (error: any) {
        console.error('LIVEKIT_TOKEN_ERROR', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
