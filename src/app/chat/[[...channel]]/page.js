'use client'

import { Realtime } from "ably"
import ChannelList from "./components/channel-list"
import { AblyProvider, ChannelProvider } from "ably/react"
import Chat from "./components/chat"
import WhosOnlineList from "./components/whos-online-list"

const Page = ({ params }) => {

  const channels = [
    { path: "/chat/announcements", label: "# Announcements" },
    { path: "/chat/general", label: "# General" },
    { path: "/chat/random", label: "# Random" },
    { path: "/chat/mods-only", label: "# Mods-only", modOnly: true },
  ]

  const client = new Realtime({
    authUrl: "/api/ably",
    autoConnect: typeof window !== 'undefined'
  })
  const channelName = `chat:${params.channel ?? "general"}`

  return (
    // How do I stop this reconnecting every time? useCallback? Put it in Layout? Something else?
    <AblyProvider client={client} >
      <ChannelProvider channelName={channelName}>
        {/* Is there a better way than clac? I don't like relying on a fixed num - feels brittle */}
        <div className="grid grid-cols-4 h-[calc(100vh-72.8px)]">
          <div className="border-r border-gray-200 p-5">
            <ChannelList channels={channels} />
          </div>
          <div className="col-span-2 flex flex-col min-h-0" >
            <Chat channelName={channelName} />
          </div>
          <div className="border-l border-gray-200 p-5">
            <WhosOnlineList channelName={channelName} />
          </div>
        </div>
      </ChannelProvider >
    </AblyProvider >
  )

}

export default Page