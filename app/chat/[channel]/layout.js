'use client'

import * as Ably from 'ably';
import { AblyProvider } from 'ably/react'
import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";

export default function ChatLayout({
    children,
}) {
    const client = new Ably.Realtime({ authUrl: '/api/ably' })
    return <AblyProvider client={client}>
        <nav>
            <h1>Comet</h1>
            <UserButton showName={true} />
        </nav>

        <aside>
            <ul>
                <li>
                    <Link href="/chat/announcements">#Announcements</Link>
                </li>
                <li>
                    <Link href="/chat/general">#General</Link>
                </li>
                <li>
                    <Link href="/chat/random">#Random</Link>
                </li>
                <li>
                    <Link href="/chat/mods-only">#Mods-only</Link>
                </li>
            </ul>
        </aside>

        {children}

    </AblyProvider>

}