import crypto from "crypto";

export function encrypt(plainText: string, privateKey: string, iv: string) {
  if (!plainText || !privateKey || !iv) {
    console.log("decrypt() -> Missing arguments.");
    return;
  }

  try {
    const hashedPrivateKey = crypto
      .createHash("SHA256")
      .update(privateKey)
      .digest();

    const ivBuffer = Buffer.from(iv, "base64");

    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      hashedPrivateKey,
      ivBuffer
    );

    let encrypted = cipher.update(plainText, "utf8", "base64");

    encrypted += cipher.final("base64");

    return encrypted;
  } catch (e) {
    console.log("encrypt() - Failed to encrypt: " + e);
    throw e;
  }
}

export function decrypt(cipherText: string, privateKey: string, iv: string) {
  if (!cipherText || !privateKey || !iv) {
    console.log("decrypt() -> Missing arguments.");
    return;
  }

  try {
    const hashedPrivateKey = crypto
      .createHash("SHA256")
      .update(privateKey)
      .digest();

    const ivBuffer = Buffer.from(iv, "base64");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      hashedPrivateKey,
      ivBuffer
    );

    let decrypted = decipher.update(cipherText, "base64", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    console.log("decrypt() - Failed to decrypt: " + e);
  }
}

export function generateSHA256Hash(plainText: string) {
  try {
    const hash = crypto.createHash("sha256");
    hash.update(plainText);
    const result = hash.digest("hex");
    return result;
  } catch (e) {
    console.log("Failed to generate hash!");
    return null;
  }
}
