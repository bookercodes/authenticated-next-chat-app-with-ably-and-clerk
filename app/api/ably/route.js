import { currentUser } from '@clerk/nextjs';
import { SignJWT } from "jose";

export const createJwt = (clientId, apiKey, claim) => {
  const [appId, signingKey] = apiKey.split(":", 2);
  const enc = new TextEncoder();
  const token = new SignJWT({
    "x-ably-capability": `{"*":["*"]}`,
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
  const role = 'swafggg'
  console.log('role', role)
  const claim = user.publicMetadata
  const tokenDetails = await createJwt(user.id, process.env.ABLY_SECRET_KEY, claim)

  return Response.json(tokenDetails)
}