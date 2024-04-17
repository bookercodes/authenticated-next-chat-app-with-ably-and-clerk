'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";


export default function ChatLayout ({ children }) {
    return <>
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
    </>
}