'use client'

import { useChannel, usePresence, usePresenceListener } from "ably/react"
import { ChannelProvider } from 'ably/react'
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import dynamic from 'next/dynamic'

const EVENT_NAMES = {
  MESSAGE: 'message',
  DELETE: 'delete'
};

export default function ChatPage({ params }) {
  const channelName = `chat:${params.channel}`
  return (
    <ChannelProvider channelName={channelName} options={{ params: { rewind: '100' } }}>
      <Chat channelName={channelName} />
    </ChannelProvider>
  )
}

const Chat = ({ channelName }) => {
  const { user } = useUser()
  const [messages, updateMessages] = useState([])
  const handleEvent = event => {
    console.log('event', event)
    if (event.name === EVENT_NAMES.MESSAGE) {
      updateMessages(prev => [...prev, event])
      return
    }

    if (event.name === EVENT_NAMES.DELETE) {
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
  const { publish: publishEvent } = useChannel(channelName, handleEvent)
  const { presenceData } = usePresenceListener(channelName)
  usePresence(channelName)

  const sendMesage = message => {
    publishEvent('message', message)
  }

  const deleteMessage = timeSerial => {
    publishEvent({
      name: 'delete',
      extras: {
        ref: {
          timeSerial
        }
      }
    })
  }

  return (
    <>
      <h2>{channelName}</h2>
      <OnlineList users={presenceData} />
      <>
        <ul>
          {messages.map(message =>
            <MessageListItem
              key={message.id}
              message={message}
              userId={user.id}
              deleteMessage={deleteMessage}
              userIsMod={user.publicMetadata.isMod} />)}
        </ul>
      </>
      <MessageInput onSubmit={sendMesage} />
    </>
  )
}


const MessageInput = ({ onSubmit }) => {
  const [input, setInput] = useState('')
  const handleChange = event => {
    setInput(event.target.value)
  }
  const handleSubmit = event => {
    event.preventDefault()
    onSubmit(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type a message"
      />
      <button type="submit">Submit</button>
    </form>
  )
}


const OnlineList = ({ users }) => {
  return <ul>
    {users.map((user, index) => <li key={index}>ONLINE {user.clientId}</li>)}
  </ul>
}

const MessageListItem = ({ message, userId, userIsMod, deleteMessage }) => {
  const { extras: { timeserial }, data, clientId } = message

  const handleClick = () => {
    deleteMessage(timeserial)
  }

  const userCanDelete = userIsMod || clientId === userId

  return (
    <li key={message.id}>
      {data} 
      {userCanDelete && <button onClick={handleClick}>X</button>}
    </li>
  )
}