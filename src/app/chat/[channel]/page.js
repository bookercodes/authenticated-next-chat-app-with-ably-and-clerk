'use client'

import { useChannel, usePresence, usePresenceListener } from "ably/react"
import * as Ably from 'ably';
import { ChannelProvider, AblyProvider } from 'ably/react'
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import dynamic from 'next/dynamic';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Input } from "@/components/ui/input"

const EVENT_NAMES = {
  MESSAGE: 'message',
  DELETE: 'delete'
};

export default dynamic(() => Promise.resolve(ChatPage), {
  ssr: false
})
const ChatPage = ({ params }) => {
  const client = new Ably.Realtime({ authUrl: '/api/ably' })
  const channelName = `chat:${params.channel}`
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channelName} options={{ params: { rewind: '100' } }}>
        <Chat channelName={channelName} />
      </ChannelProvider></AblyProvider>
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
      <ResizablePanel defaultSize={50} className="px-5">
        <ul>
          {messages.map(message =>
            <MessageListItem
              key={message.id}
              message={message}
              userId={user.id}
              deleteMessage={deleteMessage}
              userIsMod={user.publicMetadata.isMod} />)}
        </ul>
        <MessageInput onSubmit={sendMesage} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} className="px-5">
        <OnlineList users={presenceData} />
      </ResizablePanel>
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
      <Input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type a message"
      />
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