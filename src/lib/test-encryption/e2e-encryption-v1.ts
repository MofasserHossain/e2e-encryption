/* eslint-disable no-console */
import { Buffer } from 'buffer'
import crypto from 'crypto'
import nacl from 'tweetnacl'

/**
 * Fixes PEM format if needed (adds missing spaces and line breaks)
 */
function fixPublicKeyIfNeeded(pemKey: string): string {
  let fixedKey = pemKey?.trim()

  // Check if the PEM format is incorrect (missing spaces)
  const isMissingSpaces =
    fixedKey?.includes('BEGINPUBLICKEY') || fixedKey?.includes('ENDPUBLICKEY')

  if (isMissingSpaces) {
    console.log('❌ Incorrect PEM format detected. Fixing it...')

    // Fix missing spaces in headers
    fixedKey = fixedKey
      .replace(/-----BEGINPUBLICKEY-----/, '-----BEGIN PUBLIC KEY-----\n')
      .replace(/-----ENDPUBLICKEY-----/, '\n-----END PUBLIC KEY-----')

    // Ensure proper line breaks every 64 characters for readability
    fixedKey = fixedKey.replace(/(.{64})/g, '$1\n')

    console.log('✅ Fixed Public Key Format.')
  } else {
    console.log(
      '✅ Public Key is already correctly formatted. No changes needed.',
    )
  }

  return fixedKey
}

/**
 * Converts PEM key to raw Uint8Array for ECDH operations
 */
function pemToRawKey(pem: string): Uint8Array {
  const rawKey = fixPublicKeyIfNeeded(pem)
    .replace(/-----(BEGIN|END) (PRIVATE|PUBLIC) KEY-----/g, '')
    .replace(/\s+/g, '')

  console.log(`🔑 Extracting Key: ${rawKey}`)

  const keyBuffer = Buffer.from(rawKey, 'base64')

  console.log('🔑 Extracted Key Length:', keyBuffer.length)
  console.log('🔑 Key Buffer (Hex):', keyBuffer.toString('hex'))

  if (keyBuffer.length < 32) {
    throw new Error(
      `❌ Invalid key length: Expected 32 bytes, got ${keyBuffer.length}`,
    )
  }

  // **Fix: Always Extract the First 32 Bytes for ECDH**
  return new Uint8Array(keyBuffer.slice(0, 32))
}

/**
 * Derives shared secret using TweetNaCl for ECDH key exchange
 */
function deriveSharedSecret(
  privateKeyPem: string,
  peerPublicKeyPem: string,
): Buffer {
  console.log('🔑 Deriving shared secret using TweetNaCl...')

  const privateKeyRaw = pemToRawKey(privateKeyPem)
  const peerPublicKeyRaw = pemToRawKey(peerPublicKeyPem)

  console.log(
    `🔑 Private Key (Hex): ${Buffer.from(privateKeyRaw).toString('hex')}`,
  )
  console.log(
    `🔑 Public Key (Hex): ${Buffer.from(peerPublicKeyRaw).toString('hex')}`,
  )

  const sharedSecret = nacl.box.before(peerPublicKeyRaw, privateKeyRaw)

  console.log(
    `🔑 Shared Secret (Hex): ${Buffer.from(sharedSecret).toString('hex')}`,
  )
  console.log(
    `🔑 Shared Secret (Base64): ${Buffer.from(sharedSecret).toString('base64')}`,
  )

  return Buffer.from(sharedSecret)
}

/**
 * Interface for encryption result
 */
interface EncryptionResult {
  cipher: string
  nonce: string
}

/**
 * Encrypts data using AES-GCM with the shared secret
 */
async function encryptAESGCM(
  sharedSecret: Buffer,
  plaintext: string,
  nonce?: Buffer,
): Promise<EncryptionResult> {
  const nonceValue = nonce || crypto.randomBytes(12)
  console.log(`🛡️ Encryption Nonce: ${nonceValue.toString('hex')}`)

  const cipher = crypto.createCipheriv('aes-256-gcm', sharedSecret, nonceValue)
  const encryptedBuffer = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    cipher: Buffer.concat([encryptedBuffer, authTag]).toString('base64'),
    nonce: nonceValue.toString('base64'),
  }
}

/**
 * Decrypts data using AES-GCM with the shared secret
 */
function decryptAESGCM(
  sharedSecret: Buffer,
  nonceBase64: string,
  encryptedDataBase64: string,
): string {
  try {
    const nonce = Buffer.from(nonceBase64, 'base64')
    console.log(`🛡️ Decryption Nonce: ${nonce.toString('hex')}`)

    const encryptedBuffer = Buffer.from(encryptedDataBase64, 'base64')
    const authTag = encryptedBuffer.slice(-16)
    const ciphertext = encryptedBuffer.slice(0, -16)

    const decipher = crypto.createDecipheriv('aes-256-gcm', sharedSecret, nonce)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ AES-GCM Decryption Failed:', error.message)
      throw new Error(`Decryption failed: ${error.message}`)
    }
    console.error('❌ AES-GCM Decryption Failed:', error)
    throw new Error('Decryption failed')
  }
}

/**
 * Generates a new ECDSA key pair for the user
 */
export async function generatePemKeyPair(): Promise<{
  privateKeyPem: string
  publicKeyPem: string
}> {
  return new Promise((resolve) => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256', // secp256r1
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    console.log('✅ Generated Public Key (PEM):\n', publicKey)
    console.log('🔐 Generated Private Key (PEM):\n', privateKey)

    resolve({
      privateKeyPem: privateKey,
      publicKeyPem: publicKey,
    })
  })
}

/**
 * Encrypts a message using ECDH key exchange and AES-GCM
 */
export const encryptMessage = async (
  senderPrivateKey: string,
  receiverPublicKey: string,
  plaintext: string,
  nonceValue?: Buffer,
): Promise<EncryptionResult> => {
  console.log('\n\n🔑 Starting Encryption...')
  console.log('🔑 Sender Private Key:', senderPrivateKey)
  console.log('🔑 Receiver Public Key:', receiverPublicKey)
  console.log('🔑 Plaintext:', plaintext)
  console.log('🔑 Nonce Value:', nonceValue)

  const sharedSecret = deriveSharedSecret(senderPrivateKey, receiverPublicKey)
  const { cipher, nonce } = await encryptAESGCM(
    sharedSecret,
    plaintext,
    nonceValue,
  )

  return { cipher, nonce }
}

/**
 * Decrypts a message sent by another user (receiver decrypts sender's message)
 */
export const decryptSenderMessage = async (
  encryptedContent: string,
  nonce: string,
  receiverPrivateKey: string,
  senderPublicKey: string,
): Promise<string> => {
  console.log('\n\n🔓 Starting Decryption Sender Message...')
  console.log('🔓 Encrypted Content (Base64):', encryptedContent)
  console.log('🔓 Nonce (Base64):', nonce)

  const sharedSecret = deriveSharedSecret(receiverPrivateKey, senderPublicKey)

  try {
    const decryptedText = decryptAESGCM(sharedSecret, nonce, encryptedContent)
    console.log('🚀 Final Decrypted Message:', decryptedText)
    return decryptedText
  } catch (error) {
    console.log('❌ Decryption failed:', error)
    return ''
  }
}

/**
 * Decrypts own message (sender decrypts their own message)
 */
export const decryptOwnMessage = async (
  encryptedContent: string,
  nonce: string,
  senderPrivateKey: string,
  receiverPublicKey: string,
): Promise<string> => {
  console.log('\n\n🔓 Starting Decryption Own Message...')
  console.log('🔓 Encrypted Content (Base64):', encryptedContent)
  console.log('🔓 Nonce (Base64):', nonce)

  const sharedSecret = deriveSharedSecret(senderPrivateKey, receiverPublicKey)
  const decryptedText = decryptAESGCM(sharedSecret, nonce, encryptedContent)

  return decryptedText
}

export type UserKeyData = {
  publicKey: string
  privateKey: string
  encryptedPrivateKey: string
  salt: string
  iv: string
  encryptedRecoveryKey: string
  recoveryIv: string
  recoverySalt: string
}

// System recovery key for account recovery (should be stored securely in production)
export const systemRecoveryKey = `#F__32&&&___4S24____$#$$Ffdsfdsrrp___ererdsafsdf`

/**
 * Utility function to derive encryption key using PBKDF2
 */
async function deriveEncryptionKey(
  password: string,
  salt: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

/**
 * Encrypts private key using AES-GCM with a derived key from password
 */
export async function encryptPrivateKey(privateKey: string, password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const iv = crypto.randomBytes(12)
  const encryptionKey = await deriveEncryptionKey(password, salt)

  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv)
  const encryptedData = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    encryptedPrivateKey: Buffer.concat([encryptedData, authTag]).toString(
      'base64',
    ),
    salt,
    iv: iv.toString('hex'),
  }
}

/**
 * Decrypts private key using AES-GCM with the user's password
 */
export async function decryptPrivateKey(
  encryptedPrivateKey: string,
  password: string,
  salt: string,
  iv: string,
) {
  try {
    const encryptionKey = await deriveEncryptionKey(password, salt)
    const ivBuffer = Buffer.from(iv, 'hex')
    const encryptedBuffer = Buffer.from(encryptedPrivateKey, 'base64')

    const authTag = encryptedBuffer.slice(-16)
    const ciphertext = encryptedBuffer.slice(0, -16)

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      encryptionKey,
      ivBuffer,
    )
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch (_error) {
    throw new Error('Incorrect password or corrupted data.')
  }
}

/**
 * Test function for encryption/decryption
 */
export const testEncryptionDecryption = async () => {
  const plaintext = 'Hello, world!'
  console.log('🚀 Original Message:', plaintext)

  const senderKeys = await generatePemKeyPair()
  const receiverKeys = await generatePemKeyPair()

  const { cipher, nonce } = await encryptMessage(
    senderKeys.privateKeyPem,
    receiverKeys.publicKeyPem,
    plaintext,
  )

  console.log('🚀 Encrypted Message:', cipher)
  console.log('🚀 Nonce:', nonce)

  const decryptedOwnMessage = await decryptOwnMessage(
    cipher,
    nonce,
    senderKeys.privateKeyPem,
    receiverKeys.publicKeyPem,
  )
  console.log('✅ Decrypted Own Message:', decryptedOwnMessage)

  const decryptedSenderMessage = await decryptSenderMessage(
    cipher,
    nonce,
    receiverKeys.privateKeyPem,
    senderKeys.publicKeyPem,
  )
  console.log('✅ Decrypted Sender Message:', decryptedSenderMessage)
}
