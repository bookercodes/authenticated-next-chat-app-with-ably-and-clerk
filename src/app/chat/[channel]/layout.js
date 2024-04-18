'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePathname } from 'next/navigation'
import { useUser, useAuth } from "@clerk/nextjs"
import { Lock } from 'lucide-react';
import { useId } from 'react';

const ChannelLink = ({channelPath, channelName, modOnly}) => {
    const currentPath = usePathname()
    const { user } = useUser()
    const userIsMod = user?.publicMetadata?.isMod

    if (modOnly && !userIsMod) {
        return <li>
            <Link 
                className={`link flex items-center pointer-events-none ${currentPath === channelPath ? 'font-bold' : ''}`}
                aria-disabled={true}
                href={channelPath}>
                    {channelName}
                    <Lock size={16}/>
            </Link>
        </li>
    } 

    return <li>
        <Link 
            className={`link ${currentPath === channelPath ? 'font-bold' : ''}`}
            href={channelPath}>
                {channelName}
        </Link>
    </li>

}
export default function ChatLayout ({ children }) {

    return <div>
        <nav className='flex justify-between px-5 py-5 border-b border-gray-200'>
            <h1 className='font-bold'>Comet</h1>
            <UserButton showName={true} />
        </nav>
        <main  className='h-[calc(100vh-96px)]'>

        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} className='p-5'>
            <ul>
                <ChannelLink channelPath={'/chat/announcements'} channelName={'#Announcements'} />
                <ChannelLink channelPath={'/chat/general'} channelName={'#General'} />
                <ChannelLink channelPath={'/chat/random'} channelName={'#Random'} />
                <ChannelLink channelPath={'/chat/mods-only'} channelName={'#Mods-only'} modOnly />
            </ul>
            </ResizablePanel>
            <ResizableHandle withHandle />
            {children}
        </ResizablePanelGroup>
        </main>
    </div>
}