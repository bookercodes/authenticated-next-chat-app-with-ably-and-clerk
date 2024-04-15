'use client'

import styles from "./page.module.css";
import { useAuth, useUser } from "@clerk/nextjs";
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import Chat from "./chat";

export default function Home() {

  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { isSignedIn, user } = useUser()

  if (!isLoaded || !userId || !user) {
    return null;
  }

  const client = new Ably.Realtime({ authUrl: '/api/ably' })
  console.log('connecting')

  return (
    <main className={styles.main}>
      <AblyProvider client={client}>
        <ChannelProvider channelName="chat" options={{ params: { rewind: '100' } }}>
          <h1>Comet</h1>
          <Chat />
        </ChannelProvider>
      </AblyProvider>
    </main>
  )
}
