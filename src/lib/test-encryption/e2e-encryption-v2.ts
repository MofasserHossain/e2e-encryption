/* eslint-disable no-console */
import crypto from 'crypto'

interface EncryptionResult {
  cipher: string
  nonce: string
}

/**
 * Generate a new EC P-256 key pair (PEM format)
 */
export function generatePemKeyPair(): {
  privateKeyPem: string
  publicKeyPem: string
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1', // P-256
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })

  return {
    privateKeyPem: privateKey.toString(),
    publicKeyPem: publicKey.toString(),
  }
}

/**
 * Derive a shared secret using ECDH (P-256)
 */
export function deriveSharedSecret(
  privateKeyPem: string,
  peerPublicKeyPem: string,
): Buffer {
  const privateKey = crypto.createPrivateKey(privateKeyPem)
  const publicKey = crypto.createPublicKey(peerPublicKeyPem)

  const secret = crypto.diffieHellman({
    privateKey,
    publicKey,
  })

  // Ensure 32 bytes for AES-256
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * AES-256-GCM encryption
 */
export async function encryptAESGCM(
  sharedSecret: Buffer,
  plaintext: string,
  nonce?: Buffer,
): Promise<EncryptionResult> {
  const iv = nonce || crypto.randomBytes(12)

  const cipher = crypto.createCipheriv('aes-256-gcm', sharedSecret, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    cipher: Buffer.concat([encrypted, authTag]).toString('base64'),
    nonce: iv.toString('base64'),
  }
}

/**
 * AES-256-GCM decryption
 */
export function decryptAESGCM(
  sharedSecret: Buffer,
  nonceBase64: string,
  encryptedDataBase64: string,
): string {
  const iv = Buffer.from(nonceBase64, 'base64')
  const data = Buffer.from(encryptedDataBase64, 'base64')

  const authTag = data.slice(-16)
  const ciphertext = data.slice(0, -16)

  const decipher = crypto.createDecipheriv('aes-256-gcm', sharedSecret, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * High-level: encrypt a message with ECDH + AES-GCM
 */
export async function encryptMessage(
  senderPrivateKeyPem: string,
  receiverPublicKeyPem: string,
  plaintext: string,
): Promise<EncryptionResult> {
  const sharedSecret = deriveSharedSecret(
    senderPrivateKeyPem,
    receiverPublicKeyPem,
  )
  return encryptAESGCM(sharedSecret, plaintext)
}

/**
 * High-level: decrypt a message with ECDH + AES-GCM
 */
export function decryptMessage(
  encryptedContent: string,
  nonce: string,
  receiverPrivateKeyPem: string,
  senderPublicKeyPem: string,
): string {
  const sharedSecret = deriveSharedSecret(
    receiverPrivateKeyPem,
    senderPublicKeyPem,
  )
  return decryptAESGCM(sharedSecret, nonce, encryptedContent)
}

/**
 * Demo function
 */
export async function testEncryptionDecryption() {
  const plaintext = 'Hello, Next.js secure world!'

  // Generate sender & receiver key pairs
  const senderKeys = generatePemKeyPair()
  const receiverKeys = generatePemKeyPair()

  console.log('Sender Public Key:\n', senderKeys.publicKeyPem)
  console.log('Receiver Public Key:\n', receiverKeys.publicKeyPem)

  // Encrypt message
  const { cipher, nonce } = await encryptMessage(
    senderKeys.privateKeyPem,
    receiverKeys.publicKeyPem,
    plaintext,
  )

  console.log('Encrypted Message:', cipher)
  console.log('Nonce:', nonce)

  const decryptOwnMessage = decryptMessage(
    cipher,
    nonce,
    senderKeys.privateKeyPem,
    receiverKeys.publicKeyPem,
  )
  console.log('Decrypted Own Message:', decryptOwnMessage)

  // Decrypt on receiver side
  const decrypted = decryptMessage(
    cipher,
    nonce,
    receiverKeys.privateKeyPem,
    senderKeys.publicKeyPem,
  )

  console.log('Decrypted Message:', decrypted)
}
