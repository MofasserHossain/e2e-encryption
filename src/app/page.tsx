'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/chat')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/20">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                End-to-End Encrypted
              </span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to Secure Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            A secure chat application with military-grade encryption. Your
            messages are protected with E2E encryption using AES-256-GCM and
            ECDH key exchange.
          </p>

          {/* Security Features */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Security Features:
            </h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Lock className="h-3 w-3 text-blue-500" />
                <span>AES-256-GCM encryption for messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeOff className="h-3 w-3 text-green-500" />
                <span>Perfect Forward Secrecy with ECDH</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-purple-500" />
                <span>P-256 elliptic curve cryptography</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-orange-500" />
                <span>Server cannot read your messages</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link href="/auth/signin" className="flex-1">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth/signup" className="flex-1">
              <Button variant="outline" className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
