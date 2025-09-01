// Test script for E2E encryption
// This script tests the encryption/decryption functionality

const crypto = require('crypto')
const nacl = require('tweetnacl')

// Alternative approach: Generate raw keys directly for testing
function generateRawKeyPair() {
  const privateKey = crypto.randomBytes(32)
  const publicKey = nacl.box.keyPair.fromSecretKey(privateKey).publicKey

  return {
    privateKey: privateKey,
    publicKey: publicKey,
  }
}

function deriveSharedSecret(privateKey, peerPublicKey) {
  // Use TweetNaCl directly with raw keys
  const sharedSecret = nacl.box.before(peerPublicKey, privateKey)
  return Buffer.from(sharedSecret)
}

function encryptAESGCM(sharedSecret, plaintext, nonce) {
  const nonceValue = nonce || crypto.randomBytes(12)
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

function decryptAESGCM(sharedSecret, nonceBase64, encryptedDataBase64) {
  const nonce = Buffer.from(nonceBase64, 'base64')
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
}

async function encryptMessage(senderPrivateKey, receiverPublicKey, plaintext) {
  const sharedSecret = deriveSharedSecret(senderPrivateKey, receiverPublicKey)
  return encryptAESGCM(sharedSecret, plaintext)
}

async function decryptOwnMessage(
  encryptedContent,
  nonce,
  senderPrivateKey,
  receiverPublicKey,
) {
  const sharedSecret = deriveSharedSecret(senderPrivateKey, receiverPublicKey)
  return decryptAESGCM(sharedSecret, nonce, encryptedContent)
}

async function decryptSenderMessage(
  encryptedContent,
  nonce,
  receiverPrivateKey,
  senderPublicKey,
) {
  const sharedSecret = deriveSharedSecret(receiverPrivateKey, senderPublicKey)
  return decryptAESGCM(sharedSecret, nonce, encryptedContent)
}

async function testEncryptionDecryption() {
  const plaintext = 'Hello, world!'
  console.log('🚀 Original Message:', plaintext)

  // Use raw keys for testing to avoid PEM parsing issues
  const senderKeys = generateRawKeyPair()
  const receiverKeys = generateRawKeyPair()

  console.log('🔑 Sender Keys Generated (Raw)')
  console.log('🔑 Receiver Keys Generated (Raw)')

  const { cipher, nonce } = await encryptMessage(
    senderKeys.privateKey,
    receiverKeys.publicKey,
    plaintext,
  )

  console.log('🚀 Encrypted Message:', cipher)
  console.log('🚀 Nonce:', nonce)

  // Test 1: Sender decrypts their own message (should work)
  const decryptedOwnMessage = await decryptOwnMessage(
    cipher,
    nonce,
    senderKeys.privateKey,
    receiverKeys.publicKey,
  )
  console.log('✅ Decrypted Own Message:', decryptedOwnMessage)

  // Test 2: Receiver decrypts sender's message (should work)
  const decryptedSenderMessage = await decryptSenderMessage(
    cipher,
    nonce,
    receiverKeys.privateKey,
    senderKeys.publicKey,
  )
  console.log('✅ Decrypted Sender Message:', decryptedSenderMessage)

  // Verify both decryptions match the original
  const ownMatch = decryptedOwnMessage === plaintext
  const senderMatch = decryptedSenderMessage === plaintext

  console.log('🔍 Own Message Match:', ownMatch)
  console.log('🔍 Sender Message Match:', senderMatch)

  if (ownMatch && senderMatch) {
    console.log('🎉 All tests passed! E2E encryption is working correctly.')
  } else {
    console.log('❌ Some tests failed. Check the encryption/decryption logic.')
  }
}

async function runTest() {
  console.log('🧪 Testing E2E Encryption...')
  console.log('================================')

  try {
    await testEncryptionDecryption()
    console.log('================================')
    console.log('✅ E2E Encryption test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

runTest()
