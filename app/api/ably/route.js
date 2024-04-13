import { currentUser } from '@clerk/nextjs';
const Ably = require('ably');

// is this the best way to make an API route with app router?

export const GET = async (req, res) => {
  const user = await currentUser()


  // client
  //  show X button if admin
  //  show X button on own message
  // server
  //  need a way to add a claim to the Ably token that says "delete own message" or "delete any message"

  // should be able to match Clerk roles/permissions or so with Ably
  const client = new Ably.Rest({ key: process.env.ABLY_SECRET_KEY });
  const capability = {
    'chat':   ['publish', 'subscribe', 'presence']
  }
  const tokenDetails = await client.auth.createTokenRequest({ clientId: user.id, capability })
  return Response.json(tokenDetails)
}