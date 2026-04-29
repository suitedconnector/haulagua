import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Replace with actual user lookup from database
        // For now, accept any email/password combination
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email,
            name: "Test User",
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to true in production
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

export default NextAuth(authOptions)