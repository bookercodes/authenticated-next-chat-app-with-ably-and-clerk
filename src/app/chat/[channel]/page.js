'use client'

import { useChannel, usePresence, usePresenceListener } from "ably/react"
import { EllipsisVertical } from 'lucide-react';
import { Circle } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

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

  if (!user) return null

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
  usePresence(channelName, {fullName: user.fullName})
  

  const sendMesage = message => {
    console.log(user)
    publishEvent('message', {text:message, avatarUrl: user.imageUrl})
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
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={71.5} className="p-5 flex flex-col-reverse">
        <MessageInput
          onSubmit={sendMesage}
          disabled={channelName === 'chat:announcements' && !user.publicMetadata.isMod}/>
        <ul>
          {messages.map(message =>
            <MessageListItem
              key={message.id}
              message={message}
              userId={user.id}
              deleteMessage={deleteMessage}
              userIsMod={user.publicMetadata.isMod} />)}
        </ul>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={28.5} className="p-5">
        <h2 className="mb-3">Present and together right now with you in {channelName}:</h2>
        <OnlineList users={presenceData} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}


const MessageInput = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState('')
  const handleChange = event => {
    setInput(event.target.value)
  }
  const handleSubmit = event => {
    event.preventDefault()
    onSubmit(input)
    setInput('')
  }
  if (disabled) return <p>This channel is read-only...</p>
  return (
    <form onSubmit={handleSubmit} disabled>
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
    {users.map((user, index) => <li key={index} className="flex items-center mt-1"><Circle size={8} fill="#01FE19" color="#01FE19" className="mr-1" />{user.data.fullName}</li>)}
  </ul>
}

const MessageListItem = ({ message, userId, userIsMod, deleteMessage }) => {
  const { extras: { timeserial }, data, clientId } = message

  const handleClick = () => {
    deleteMessage(timeserial)
  }

  const userCanDelete = userIsMod || clientId === userId

  return (
    <li key={message.id} className="p-3 my-2 bg-slate-50 rounded-lg flex justify-between relative group">
      <div className="flex items-center">
      <Avatar className='mr-2'>
        <AvatarImage src={data.avatarUrl}/>
        {/* <AvatarFallback>CN</AvatarFallback> */}
      </Avatar>
      {data.text}
</div>
      {/* {userCanDelete && <button onClick={handleClick}>X</button>} */}
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>
            <EllipsisVertical size={16} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!userCanDelete} onClick={handleClick}>Delete</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </li>
  )
}