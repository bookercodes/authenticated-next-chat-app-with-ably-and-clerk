'use client'

import { useChannel, } from "ably/react"
import MessageInput from "./message-input"
import MessageList from "./message-list"
import { useUser } from "@clerk/nextjs"
import { useReducer } from "react"

const reducer = (prev, event) => {
  switch (event.name) {
    case 'message':
      return [...prev, event]
    case 'delete': {
      const userIsMod = JSON.parse(event.extras.userClaim).isMod
      const refTimeSerial = event.extras.ref.timeSerial
      return prev.filter(message => {
        const messageHasSameClientId = message.clientId === event.clientId
        const messageHasSameTimeSerial = message.extras.timeserial === refTimeSerial

        // If the message comes from the same client or the user is a moderator, drop the message.
        if (messageHasSameTimeSerial && (messageHasSameClientId || userIsMod)) {
          return false
        }

        return true
      })
    }
  }
}

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

  const { user } = useUser()
  const [messages, dispatch] = useReducer(reducer, [])
  const { publish } = useChannel(channelName, dispatch)

  return <div className="flex flex-col justify-end h-full">
    <MessageList
      messages={messages}
      user={user}
      onDelete={deleteMessage} />
    <MessageInput onSubmit={publishMessage} />
  </div>
}

export default Chat