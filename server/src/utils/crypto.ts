import crypto from "crypto";

const algorithm = "aes-256-cbc"; // Using AES encryption

export function encrypt(rawText: string, privateKey: string) {
  try {
    const iv = crypto.randomBytes(16); // Generate a random initialization vector

    const cipher = crypto.createCipheriv(algorithm, privateKey, iv);

    let encrypted = cipher.update(rawText, "utf8", "hex");

    encrypted += cipher.final("hex");

    return encrypted;
  } catch (e) {
    console.log("encrypt() - Failed to encrypt: " + e);
  }
}

export function decrypt(cipherText: string, privateKey: string) {
  try {
    const iv = crypto.randomBytes(16); // Generate a random initialization vector

    const decipher = crypto.createDecipheriv(algorithm, privateKey, iv);

    let decrypted = decipher.update(cipherText, "hex", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    console.log("decrypt() - Failed to decrypt: " + e);
  }
}
