import { NextRequest, NextResponse } from 'next/server'

/**
 * Cookie names for encryption keys
 */
export const COOKIE_NAMES = {
  PRIVATE_KEY: 'e2e-private-key',
  PUBLIC_KEY: 'e2e-public-key',
  TOKEN: 'auth-token',
} as const

/**
 * Sets encryption keys in cookies (server-side)
 */
export function setEncryptionKeysInCookies(
  response: NextResponse,
  keys: {
    token?: string
    privateKey?: string
    publicKey?: string
  },
): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }

  if (keys.privateKey) {
    response.cookies.set(
      COOKIE_NAMES.PRIVATE_KEY,
      keys.privateKey,
      cookieOptions,
    )
  }

  if (keys.publicKey) {
    response.cookies.set(COOKIE_NAMES.PUBLIC_KEY, keys.publicKey, cookieOptions)
  }

  if (keys.token) {
    response.cookies.set(COOKIE_NAMES.TOKEN, keys.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
  }

  return response
}

/**
 * Gets encryption keys from cookies (server-side)
 */
export function getEncryptionKeysFromCookies(request: NextRequest) {
  return {
    privateKey: request.cookies.get(COOKIE_NAMES.PRIVATE_KEY)?.value,
    publicKey: request.cookies.get(COOKIE_NAMES.PUBLIC_KEY)?.value,
    token: request.cookies.get(COOKIE_NAMES.TOKEN)?.value,
  }
}

/**
 * Clears all encryption keys from cookies (server-side)
 */
export function clearEncryptionKeysFromCookies(
  response: NextResponse,
): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 0,
    path: '/',
  }

  response.cookies.set(COOKIE_NAMES.PRIVATE_KEY, '', cookieOptions)
  response.cookies.set(COOKIE_NAMES.PUBLIC_KEY, '', cookieOptions)
  response.cookies.set(COOKIE_NAMES.TOKEN, '', cookieOptions)
  return response
}

/**
 * Client-side cookie utilities
 */
export const clientCookieUtils = {
  /**
   * Sets encryption keys in cookies (client-side)
   */
  setEncryptionKeys: (keys: {
    privateKey?: string
    publicKey?: string
    token?: string
  }) => {
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    }

    if (keys.privateKey) {
      document.cookie = `${COOKIE_NAMES.PRIVATE_KEY}=${keys.privateKey}; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}`
    }

    if (keys.publicKey) {
      document.cookie = `${COOKIE_NAMES.PUBLIC_KEY}=${keys.publicKey}; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}`
    }

    if (keys.token) {
      document.cookie = `${COOKIE_NAMES.TOKEN}=${keys.token}; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}`
    }
  },

  /**
   * Gets encryption keys from cookies (client-side)
   */
  getEncryptionKeys: () => {
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    return {
      privateKey: cookies[COOKIE_NAMES.PRIVATE_KEY],
      publicKey: cookies[COOKIE_NAMES.PUBLIC_KEY],
      token: cookies[COOKIE_NAMES.TOKEN],
    }
  },

  /**
   * Clears all encryption keys from cookies (client-side)
   */
  clearEncryptionKeys: () => {
    const cookieOptions = {
      expires: new Date(0),
      path: '/',
    }

    document.cookie = `${COOKIE_NAMES.PRIVATE_KEY}=; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}`
    document.cookie = `${COOKIE_NAMES.PUBLIC_KEY}=; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}`
    document.cookie = `${COOKIE_NAMES.TOKEN}=; expires=${cookieOptions.expires.toUTCString()}; path=${cookieOptions.path}`
  },
}
