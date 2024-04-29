'use client'
import { useChannel, } from "ably/react"
import MessageInput from "./message-input"
import MessageList from "./message-list"
import { useUser } from "@clerk/nextjs"
import { useReducer, useEffect, useRef } from "react"

const ADD = "ADD"
const DELETE = "DELETE"

const reducer = (prev, event) => {
  switch (event.name) {
    case ADD:
      return [...prev, event]
    case DELETE:
      const isMod = JSON.parse(event.extras.userClaim).isMod
      // Can this be expressed more cleanly?
      return prev.filter(msg => {
        const match = msg.extras.timeserial === event.extras.ref.timeserial
        const ownMsg = msg.clientId === event.clientId
        if (match && (ownMsg || isMod)) {
          return false
        }
        return true
      })
    case "clear":
      return []
  }
}

const Chat = ({ channelName }) => {

  const publishMessage = text => {
    publish({
      name: ADD,
      data: {
        text,
        avatarUrl: user.imageUrl
      }
    })
  }

  const deleteMessage = timeSerial => {
    publish({
      name: DELETE,
      extras: {
        ref: {
          timeserial: timeSerial
        }
      }
    })
  }

  const { user } = useUser()
  const [messages, dispatch] = useReducer(reducer, [])
  const { channel, publish } = useChannel(channelName, dispatch)
  const scrollRef = useRef(null)

  useEffect(() => {
    // https://react.dev/learn/synchronizing-with-effects#fetching-data
    // In general I see a lot of components firing twice in development mode and when using HMR
    // makes me think I don't fully understand all this
    let ignore = false
    const fetchHist = async () => {
      const history = await channel.history({ limit: 1000, direction: "forwards" })
      if (!ignore)
        history.items.forEach(dispatch)
    }
    fetchHist()
    return () => {
      ignore = true
      // dispatch({ name: "clear" })
    }
  }, [channel])

  useEffect(() => {
    scrollRef.current.scrollIntoView()
  }, [messages.length])

  return (
    <div className="flex flex-col h-full">
      <div className="mt-auto overflow-hidden">
        <MessageList
          messages={messages}
          user={user}
          onDelete={deleteMessage} />
        <div ref={scrollRef} />
      </div>
      <div>
        <MessageInput
          onSubmit={publishMessage}
          readOnly={channelName === "chat:announcements" && !user.publicMetadata.isMod} />
      </div>
    </div >
  )
}

export default Chat