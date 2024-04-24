'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePathname } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import { Lock } from 'lucide-react';

import * as Ably from 'ably';
import { useChannel, usePresence, usePresenceListener } from "ably/react"
import { EllipsisVertical } from 'lucide-react';
import { Circle } from 'lucide-react';
import { ChannelProvider, AblyProvider } from 'ably/react'
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

const EVENT_NAMES = {
  MESSAGE: 'message',
  DELETE: 'delete'
};


const ChannelLink = ({ channelPath, channelName, modOnly }) => {
  const currentPath = usePathname()
  const { user } = useUser()
  const userIsMod = user?.publicMetadata?.isMod

  if (modOnly && !userIsMod) {
    return <li>
      <Link
        className={`link flex items-center pointer-events-none ${currentPath === channelPath ? 'font-bold' : ''}`}
        aria-disabled={true}
        href={channelPath}>
        {channelName}
        <Lock size={16} />
      </Link>
    </li>
  }

  return <li>
    <Link
      className={`link ${currentPath === channelPath ? 'font-bold' : ''}`}
      href={channelPath}>
      {channelName}
    </Link>
  </li>

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
          <AvatarImage src={data.avatarUrl} />
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
const OnlineList = ({ users }) => {
  return <ul>
    {users.map((user, index) => <li key={index} className="flex items-center mt-1"><Circle size={8} fill="#01FE19" color="#01FE19" className="mr-1" />{user.data.fullName}</li>)}
  </ul>
}


const Foo = ({ channelName }) => {

  const handleEvent = event => {
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

  // if (!user) {
  //   return null
  // }
  const { user } = useUser()
  const { publish: publishEvent } = useChannel(channelName, handleEvent)
  const { presenceData } = usePresenceListener(channelName)
  const [messages, updateMessages] = useState([])
  usePresence(channelName, { fullName: user?.fullName })

  const sendMesage = message => {
    publishEvent('message', { text: message, avatarUrl: user.imageUrl })
  }

  const deleteMessage = timeSerial => {
    console.log("deleteMessage", timeSerial)
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
    <div>
      <MessageInput
        onSubmit={sendMesage}
        disabled={channelName === 'chat:announcements' && !user.publicMetadata.isMod} />
      <ul>
        {messages.map(message =>
          <MessageListItem
            key={message.id}
            message={message}
            userId={user.id}
            deleteMessage={deleteMessage}
            userIsMod={user.publicMetadata.isMod} />)}
      </ul>
      <div>
        <h2 className="mb-3">Present and together right now with you in {channelName}:</h2>
        <OnlineList users={presenceData} />
      </div>
    </div>

  )
}

export default function Chat({ params }) {
  const channelName = `chat:${params.channel}`
  const client = new Ably.Realtime({ authUrl: '/api/ably' })

  return <div>

    <nav className='flex justify-between px-5 py-5 border-b border-gray-200'>
      <h1 className='font-bold'>Comet</h1>
      <UserButton showName={true} afterSignOutUrl="/" />
    </nav>

    <main className='h-[calc(100vh-96px)]'>
      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel defaultSize={25} className='p-5'>
          <ul>
            <ChannelLink channelPath={'/chat/announcements'} channelName={'#Announcements'} />
            <ChannelLink channelPath={'/chat/general'} channelName={'#General'} />
            <ChannelLink channelPath={'/chat/random'} channelName={'#Random'} />
            <ChannelLink channelPath={'/chat/mods-only'} channelName={'#Mods-only'} modOnly />
          </ul>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} className="p-5 flex flex-col-reverse">
          <AblyProvider client={client}>
            <ChannelProvider channelName={channelName} options={{ params: { rewind: '100' } }}>
              <Foo channelName={channelName} />
            </ChannelProvider>
          </AblyProvider>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25}>
          <p>Hello</p>
        </ResizablePanel>


        <ResizableHandle withHandle />

      </ResizablePanelGroup>
    </main >
  </div >
}