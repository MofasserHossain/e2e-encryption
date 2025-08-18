import { prisma } from '@/lib/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { NextAuthConfig } from 'next-auth'
import Email from 'next-auth/providers/email'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.isOnboarded = user.isOnboarded
        token.username = user.username
      }

      // Handle session update during onboarding
      if (trigger === 'update' && session) {
        token.isOnboarded = session.user.isOnboarded
        token.username = session.user.username
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.isOnboarded = token.isOnboarded as boolean
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
