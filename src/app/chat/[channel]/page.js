import dynamic from 'next/dynamic'
import ChannelList from "./components/channel-list"
const Chat = dynamic(() => import('./components/chat'), {
  ssr: false
})

const Page = ({ params }) => {

  const channels = [
    { path: "/chat/announcements", label: "# Announcements" },
    { path: "/chat/general", label: "# General" },
    { path: "/chat/random", label: "# Random" },
    { path: "/chat/mods-only", label: "# Mods-only", modsOnly: true },
  ]

  return <div>
    <ChannelList channels={channels} />
    <Chat channel={params.channel} />
  </div>
}

export default Page