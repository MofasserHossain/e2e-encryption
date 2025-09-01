'use client'

import { clientCookieUtils } from '@/lib/cookie-utils'
import { useCallback, useState } from 'react'

interface EncryptionKeys {
  privateKey?: string
  publicKey?: string
  encryptedPrivateKey?: string
  salt?: string
  iv?: string
  encryptedRecoveryKey?: string
  recoveryIv?: string
  recoverySalt?: string
}

export function useE2EEncryption() {
  const [keys, setKeys] = useState<EncryptionKeys>(() => {
    // Initialize keys from cookies on mount
    if (typeof window !== 'undefined') {
      return clientCookieUtils.getEncryptionKeys()
    }
    return {}
  })

  const setEncryptionKeys = useCallback((newKeys: EncryptionKeys) => {
    clientCookieUtils.setEncryptionKeys(newKeys)
    setKeys(newKeys)
  }, [])

  const clearEncryptionKeys = useCallback(() => {
    clientCookieUtils.clearEncryptionKeys()
    setKeys({})
  }, [])

  const getEncryptionKeys = useCallback(() => {
    return clientCookieUtils.getEncryptionKeys()
  }, [])

  const hasValidKeys = useCallback(() => {
    const currentKeys = getEncryptionKeys()
    return !!(currentKeys.privateKey && currentKeys.publicKey)
  }, [getEncryptionKeys])

  return {
    keys,
    setEncryptionKeys,
    clearEncryptionKeys,
    getEncryptionKeys,
    hasValidKeys,
  }
}
