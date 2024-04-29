import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';

const isChatRoute = createRouteMatcher(['/chat(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isChatRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}