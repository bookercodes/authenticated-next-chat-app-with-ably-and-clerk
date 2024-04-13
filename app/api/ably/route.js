import { currentUser } from '@clerk/nextjs';
const Ably = require('ably');
import { SignJWT } from "jose";

// is this the best way to make an API route with app router?
export const CreateJWT = (clientId, apiKey, claim) => {

  const [appId, signingKey] = apiKey.split(":", 2);

  const enc = new TextEncoder();
  
  const y=  new SignJWT({
    "x-ably-capability": `{"*":["*"]}`,
    "x-ably-clientId": clientId,
    "ably.channel.*": claim,
    // 'ably.limits.publish.perAttachment.maxRate.chat': 0.1,
  })
    .setProtectedHeader({ kid: appId, alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(enc.encode(signingKey));
    return y
};

export const GET = async (req, res) => {
  const user = await currentUser()


  // client
  //  show X button if admin
  //  show X button on own message
  // server
  //  need a way to add a claim to the Ably token that says "delete own message" or "delete any message"

  // should be able to match Clerk roles/permissions or so with Ably
  const client = new Ably.Rest({ key: process.env.ABLY_SECRET_KEY });
  // const tokenDetails = await client.auth.requestToken({ clientId: user.id })
  const tokenDetails = await CreateJWT(user.id, process.env.ABLY_SECRET_KEY, "mod")
  console.log(tokenDetails)
  
  return Response.json(tokenDetails)
}