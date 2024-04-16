import { currentUser } from '@clerk/nextjs';
import { SignJWT } from "jose"

const createToken = (clientId, apiKey, claim, capability) => {
  const [appId, signingKey] = apiKey.split(":", 2)
  const enc = new TextEncoder()

  const token = new SignJWT({
    "x-ably-capability": JSON.stringify(capability),
    "x-ably-clientId": clientId,
    "ably.channel.*": JSON.stringify(claim)
    // 'ably.limits.publish.perAttachment.maxRate.chat': 0.1,
  })
    .setProtectedHeader({ kid: appId, alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(enc.encode(signingKey))
  return token
}

const generateCapability = claim => {
  if (claim.isMod) {
    return { '*': ['*'] };
  } else {
    return {
      'chat:general': ['subscribe', 'publish', 'presence'],
      'chat:random': ['subscribe', 'publish', 'presence'],
      'chat:announcements': ['subscribe', 'presence']
    }
  }
}

export const GET = async () => {
  const user = await currentUser()
  const userClaim = user.publicMetadata
  const userCapability = generateCapability(userClaim)

  const token = await createToken(
    user.id,
    process.env.ABLY_SECRET_KEY,
    userClaim,
    userCapability)

  return Response.json(token)
}