'use client'
import { useChannel, } from "ably/react"
import MessageInput from "./message-input"
import MessageList from "./message-list"
import { useUser } from "@clerk/nextjs"
import { useReducer, useEffect } from "react"


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
      console.log("Clearing")
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

  useEffect(() => {
    // console.log("firing history");
    // const fetchHistory = async () => {
    //   const h = await channel.history({ limit: 2 })
    //   h.items.forEach(dispatch)
    // }
    // fetchHistory()
    // return () => {
    //   console.log("cleanup on isle 3");
    //   dispatch({ name: "clear" })
    // }
  }, [channel])

  return <div className="flex flex-col justify-end h-full">
    <MessageList
      messages={messages}
      user={user}
      onDelete={deleteMessage} />
    <MessageInput onSubmit={publishMessage} />
  </div>
}

export default Chat