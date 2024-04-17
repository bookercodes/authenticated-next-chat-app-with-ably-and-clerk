'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePathname } from 'next/navigation'



export default function ChatLayout ({ children }) {
    const pathname = usePathname()
    return <div>
        <nav className='flex justify-between px-5 py-5 border-b border-gray-200'>
            <h1 className='font-bold'>Comet</h1>
            <UserButton showName={true} />
        </nav>
        <main  className='h-[calc(100vh-96px)]'>

        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} className='p-5'>
            <ul>
                <li>
                    <Link className={`link ${pathname === '/chat/announcements' ? 'font-bold' : ''}`} href="/chat/announcements">#Announcements</Link>

                </li>
                <li>
                    <Link className={`link ${pathname === '/chat/general' ? 'font-bold' : ''}`} href="/chat/general">#General</Link>
                </li>
                <li>
                    <Link className={`link ${pathname === '/chat/random' ? 'font-bold' : ''}`} href="/chat/random">#Random</Link>
                </li>
                <li>
                    <Link className={`link ${pathname === '/chat/mods-only' ? 'font-bold' : ''}`} href="/chat/mods-only">#Mods-only</Link>
                </li>
            </ul>
            </ResizablePanel>
            <ResizableHandle withHandle />
            {children}
        </ResizablePanelGroup>
        </main>
    </div>
}