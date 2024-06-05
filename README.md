## Authenticated Next WebSocket chat app

1. Clone the repo
2. `cd` into the local clone
3. `npm install`
4. Create an Ably app
- Go to **Settings** and click **Add new rule**. Set **Channel namespace** to "chat". Tick **Persist all messages** and tick **Message interactions enabled**
- Note the env vars
5. Create a Clerk app 
- Enable **Email**, **Phone number**, and **Username** sign in options. Go to **Users & Authentication** > **Email, Phone, Username** and tick **Name**. Go to **Customization** > **Avatars** and tick **Initials**.
- Note the the env vars
4. Create `.env.local` with the notes env vars:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ABLY_SECRET_KEY=
```

5. Run `npm run dev`