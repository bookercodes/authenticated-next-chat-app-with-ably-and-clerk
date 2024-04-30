'use client'
import { usePresence, usePresenceListener } from "ably/react"
import { useUser } from "@clerk/nextjs"
import { Circle } from 'lucide-react';

const WhosOnlineList = ({ channelName }) => {

  const { user } = useUser()
  const { presenceData } = usePresenceListener(channelName)
  usePresence(channelName, { fullName: user.fullName })
  const users = presenceData
  const color = "#01FE19"

  const createLi = user => {
    return (
      <li
        key={user.id}
        className="flex items-center">
        <Circle className="mr-1" size={8} fill={color} color={color} />
        {user.data.fullName}
      </li>
    )
  }

  return <div>
    <h2 className="mb-2.5">Present and together right now with you in {channelName}:</h2>
    <ul>{users.map(createLi)}</ul>
  </div>
}
export default WhosOnlineList