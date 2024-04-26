'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useUser } from '@clerk/nextjs'
import { Lock } from 'lucide-react';

const ChannelList = ({ channels }) => {

  const currentPath = usePathname()
  const { user } = useUser()
  const userIsMod = user?.publicMetadata.isMod

  const createLi = channel => {
    const locked = channel.modOnly && !userIsMod
    return <li key={channel.path}>
      <Link
        href={channel.path}
        className={clsx('flex items-center', {
          'font-bold': currentPath === channel.path,
          'pointer-events-none': locked
        })}>
        {channel.label}
        {locked && <Lock className="m-1" size={16} />}
      </Link>
    </li >
  }

  return <ul> {channels.map(createLi)} </ul>
}

export default ChannelList