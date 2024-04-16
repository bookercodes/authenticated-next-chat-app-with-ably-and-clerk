import { currentUser } from '@clerk/nextjs';
import { SignJWT } from "jose";

export const createJwt = (clientId, apiKey, claim, capability) => {
  const [appId, signingKey] = apiKey.split(":", 2);
  const enc = new TextEncoder();

  const x = JSON.stringify(capability)
  console.log("x", x)
  const token = new SignJWT({
    "x-ably-capability": x,
    "x-ably-clientId": clientId,
    "ably.channel.*": JSON.stringify(claim)
    // 'ably.limits.publish.perAttachment.maxRate.chat': 0.1,
  })
    .setProtectedHeader({ kid: appId, alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(enc.encode(signingKey));
  return token
};

export const GET = async () => {
  const user = await currentUser()
  // todo - put Clerk metadata into Ably claim
  const claim = user.publicMetadata

  // Capabilities are a map from resources to a list of operations. 
  // A resource of namespace:* will match any channel in the namespace namespace, including namespace:channel, and namespace:channel:other
  // capabilities = subscribe, publish, presence, history, stats, publish-subscribe

  let capability

  if (claim.isMod) {
    capability = {
      '*': ['*']
    }
  } else  {
    capability = {
      'chat:general': ['subscribe', 'publish', 'presence'],
      'chat:random': ['subscribe', 'publish', 'presence'],
    }
  }

  const tokenDetails = await createJwt(user.id, process.env.ABLY_SECRET_KEY, claim, capability)

  return Response.json(tokenDetails)
}