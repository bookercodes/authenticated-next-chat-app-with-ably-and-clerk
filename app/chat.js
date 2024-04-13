import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { useChannel, usePresence, usePresenceListener } from "ably/react"
import { useState } from "react";

export default function Chat() {
    const { isLoaded, userId, sessionId, getToken } = useAuth();
    const { isSignedIn, user } = useUser()

    if (!isLoaded || !userId || !user) {
        return null;
    }

    const [messages, updateMessages] = useState([]);
    const { channel } = useChannel('chat', (message) => {
        if (message.name === "message") {
            console.log('message', message)
            updateMessages((prev) => [...prev, message]);
        } else if (message.name === "delete") {
            const lookThisUpAndDelete = message.extras.ref.timeserial
            updateMessages((msgs) => {
                return msgs.filter(msg => msg.extras && msg.extras.timeserial !== lookThisUpAndDelete);
            })
            console.log('got a delete request')
        }
    })
    const { updateStatus } = usePresence('chat')
    const { presenceData } = usePresenceListener('chat');

    const sendMessage = text => channel.publish('message', text)

    const peers = presenceData.map((msg, index) => <li key={index}>{msg.clientId}: {msg.data}</li>);


    const role = user.publicMetadata.role
    console.log('role', role)

    const deleteMessage = async timeserial => {
        await channel.publish({
            name: 'delete',
            data: '',
            extras: {
                ref: {
                    type: 'com.ably.delete',
                    timeserial
                }
            }
        })
    }

    return <div>
        <UserButton />
        <h1>Chat</h1>
        <div>
            {peers}
        </div>
        <br />
        <p>Hello, {user.firstName} ({userId}) your current active session is {sessionId}</p>

        <br />
        <div>

            <ul>
                {messages.map(m => {

                    let btn 
                    console.log(`${m.clientId}===${user.id}`)
                    if (role === "mod" || m.clientId === user.id)
                        btn = <button onClick={() => deleteMessage(m.extras.timeserial)}>X</button>

                    return <li>{m.clientId}: {m.data}{btn}</li>
                }
                )}
            </ul>
        </div>

        <form onSubmit={e => {
            const txt = e.target.elements.text.value
            sendMessage(txt)
            e.preventDefault()
        }}>
            <input type="text" name="text" />
            <button type="submit">Submit</button>
        </form>

    </div>
}