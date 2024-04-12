import { currentUser } from '@clerk/nextjs';
const Ably = require('ably');

// is this the best way to make an API route with app router?

export const GET = async (req, res) => {
  const user = await currentUser()
  // should be able to match Clerk roles/permissions or so with Ably
  const client = new Ably.Rest({ key: process.env.ABLY_SECRET_KEY });
  const capability = {
    'chat:*':   ['publish', 'subscribe', 'presence']
  }
  const tokenDetails = await client.auth.createTokenRequest({ clientId: user.id })
  return Response.json(tokenDetails)
}