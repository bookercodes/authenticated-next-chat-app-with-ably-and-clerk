'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';


export default function ChatLayout ({ children }) {
    return <>
        <nav className='flex justify-between px-5 py-8 '>
            <h1 className='font-bold'>Comet</h1>
            <UserButton showName={true} />
        </nav>
        
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} className='px-5'>
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
            </ResizablePanel>
            <ResizableHandle withHandle />
            {children}
        </ResizablePanelGroup>
    </>
}