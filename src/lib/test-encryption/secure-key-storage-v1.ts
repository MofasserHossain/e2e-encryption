import {
  decryptPrivateKey,
  encryptPrivateKey,
  generatePemKeyPair,
  systemRecoveryKey,
  UserKeyData,
} from './e2e-encryption-v1'

/**
 * Registers a new user by generating a key pair, encrypting it, and storing securely
 */
export async function registerUser(password: string): Promise<UserKeyData> {
  // Generate key pair
  const { publicKeyPem, privateKeyPem } = await generatePemKeyPair()

  // Encrypt the private key with user password
  const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(
    privateKeyPem,
    password,
  )

  // Encrypt private key with system recovery key (for account recovery)
  const recoveryData = await encryptPrivateKey(privateKeyPem, systemRecoveryKey)

  // Store data in backend (simulated)
  const userData = {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
    encryptedPrivateKey,
    salt,
    iv,
    encryptedRecoveryKey: recoveryData.encryptedPrivateKey,
    recoveryIv: recoveryData.iv,
    recoverySalt: recoveryData.salt,
  }
  return userData
}

/**
 * Logs in a user by decrypting the private key with their password
 */
export async function loginUserWithPassword(
  encryptedPrivateKey: string,
  password: string,
  salt: string,
  iv: string,
): Promise<string> {
  const privateKey = await decryptPrivateKey(
    encryptedPrivateKey,
    password,
    salt,
    iv,
  )
  return privateKey
}

/**
 * Resets password using system recovery key
 */
export async function resetPassword(
  encryptedRecoveryKey: string,
  recoveryIv: string,
  recoverySalt: string,
  newPassword: string,
): Promise<Partial<UserKeyData>> {
  // Use correct IV and Salt for decryption
  const privateKey = await decryptPrivateKey(
    encryptedRecoveryKey,
    systemRecoveryKey,
    recoverySalt, // <== Use correct salt
    recoveryIv, // <== Use correct IV
  )

  // Encrypt with new password
  const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(
    privateKey,
    newPassword,
  )

  return { encryptedPrivateKey, salt, iv }
}

/**
 * Changes password securely if user remembers old password
 */
export async function changePassword(
  encryptedPrivateKey: string,
  oldPassword: string,
  newPassword: string,
  salt: string,
  iv: string,
) {
  // Decrypt the private key with the old password
  const privateKey = await decryptPrivateKey(
    encryptedPrivateKey,
    oldPassword,
    salt,
    iv,
  )

  // Encrypt with new password
  const {
    encryptedPrivateKey: newEncryptedKey,
    salt: newSalt,
    iv: newIv,
  } = await encryptPrivateKey(privateKey, newPassword)

  return { newEncryptedKey, newSalt, newIv }
}

/**
 * Simulates backend storage and flow
 */
export async function testSecureKeyStorage() {
  const password = 'UserPassword123'

  // Register user
  const userData = await registerUser(password)

  // Login with correct password
  const _privateKey = await loginUserWithPassword(
    userData.encryptedPrivateKey,
    password,
    userData.salt,
    userData.iv,
  )

  // Change password
  const newPassword = 'NewSecurePassword123'
  const _updatedData = await changePassword(
    userData.encryptedPrivateKey,
    password,
    newPassword,
    userData.salt,
    userData.iv,
  )

  // Reset password using system recovery key
  const _resetData = await resetPassword(
    userData.encryptedRecoveryKey,
    userData.recoveryIv,
    userData.recoverySalt,
    'ResetPassword123',
  )
}

// Example of the data structure returned:
// {
//   "encryptedPrivateKey": "b4SA+6IQHWCa7SHNQIJ86ypRFrRcenKXQ...",
//   "iv": "61a83825a37866b7d38ca366",
//   "salt": "dc706c2ac2273b6b1a3b8f13a7f1ed52",
//   "encryptedRecoveryKey": "UTaeQmZuLbMws7txp9FtBESlZtsG+Jjc...",
//   "recoveryIv": "1234567890abcdef1234567890abcdef",
//   "recoverySalt": "abcdef1234567890abcdef1234567890",
// }
