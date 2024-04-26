'use client'
import { Realtime } from "ably"
import {
  AblyProvider,
  ChannelProvider,
  useChannel,
  usePresence,
  usePresenceListener
} from "ably/react"
import MessageInput from "./message-input"
import MessageList from "./message-list"
import WhosOnlineList from "./whos-online-list"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"

const Chat = ({ channelName }) => {

  const publishMessage = text => {
    publish({
      name: "message",
      data: {
        text,
        avatarUrl: user.imageUrl
      }
    })
  }

  const deleteMessage = timeSerial => {
    publish({
      name: "delete",
      extras: {
        ref: {
          timeSerial
        }
      }
    })
  }

  const handleEvent = event => {
    if (event.name === "message") {
      updateMessages(prev => [...prev, event])
      return
    }

    if (event.name === "delete") {
      updateMessages(previousMessages => {
        const userIsMod = JSON.parse(event.extras.userClaim).isMod
        const refTimeSerial = event.extras.ref.timeSerial

        return previousMessages.filter(message => {
          const messageHasSameClientId = message.clientId === event.clientId
          const messageHasSameTimeSerial = message.extras.timeserial === refTimeSerial

          // If the message comes from the same client or the user is a moderator, drop the message.
          if (messageHasSameTimeSerial && (messageHasSameClientId || userIsMod)) {
            return false
          }

          return true
        })
      })
    }

  }

  const { user } = useUser()
  const { publish } = useChannel(channelName, handleEvent)
  const [messages, updateMessages] = useState([])

  return <>
    <>
      <MessageList
        messages={messages}
        user={user}
        onDelete={deleteMessage} />
      <MessageInput onSubmit={publishMessage} />
    </>
    <WhosOnlineList />
  </>
}

const ChatWithAblyContext = ({ channel }) => {
  const channelName = `chat:${channel}`
  const client = new Realtime({ authUrl: "/api/ably" })

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channelName}>
        <Chat channelName={channelName} />
      </ChannelProvider>
    </AblyProvider >
  )
}
export default ChatWithAblyContext