'use client'

import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { useEffect, useState } from 'react'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
    roomId: string
    doubtTitle: string
}

export default function VideoRoom({ roomId, doubtTitle }: Props) {
    const [token, setToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/livekit/token?room=${roomId}`)
                const data = await resp.json()
                if (data.error) {
                    setError(data.error)
                } else {
                    setToken(data.token)
                }
            } catch (e: any) {
                setError(e.message)
            }
        })()
    }, [roomId])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-red-400 font-bold mb-4">Error: {error}</div>
                <Link href={`/doubts/${roomId}`} className="btn-secondary">Return to Doubt</Link>
            </div>
        )
    }

    if (token === null) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-4" />
                <p className="text-white/50">Connecting to session...</p>
            </div>
        )
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={() => {
                window.location.href = `/doubts/${roomId}?call_ended=true`
            }}
            data-lk-theme="default"
            className="rounded-2xl overflow-hidden border border-white/5 h-[70vh]"
        >
            <VideoConference />
        </LiveKitRoom>
    )
}

function VideoConference() {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ])

    return (
        <div className="relative flex flex-col h-full bg-[#0a0a14]">
            <GridLayout tracks={tracks} className="flex-1 p-4">
                <ParticipantTile />
            </GridLayout>
            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-center">
                <ControlBar variation="minimal" />
            </div>
            <RoomAudioRenderer />
        </div>
    )
}
