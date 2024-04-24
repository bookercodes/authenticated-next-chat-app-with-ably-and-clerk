'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ChannelList = ({ channels }) => {

  const currentPath = usePathname()

  const createLi = channel => {
    return <li>
      <Link
        href={channel.path}
        className={`${currentPath === channel.path ? 'font-bold' : ''}`}>
        {channel.label}
      </Link>
    </li >
  }

  return <ul> {channels.map(createLi)} </ul>
}
export default ChannelList