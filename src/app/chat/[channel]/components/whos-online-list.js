'use client'
import { usePresence, usePresenceListener } from "ably/react"
import { useUser } from "@clerk/nextjs"

const WhosOnlineList = ({ channelName }) => {

  const { user } = useUser()
  console.log("rendering WhosOnlineList")
  console.log("user", user)
  const { presenceData } = usePresenceListener(channelName)
  usePresence(channelName, { fullName: user.fullName })
  const users = presenceData

  const createLi = user => {
    return <li key={user.id}>{user.data.fullName}</li>
  }

  return <div>
    <h2>Present and together right now with you in {channelName}</h2>
    <ul>{users.map(createLi)}</ul>
  </div>
}
export default WhosOnlineList