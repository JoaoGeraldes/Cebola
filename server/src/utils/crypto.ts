import crypto from "crypto";

const algorithm = "aes-256-cbc"; // Using AES encryption

export function encrypt(rawText: string, privateKey: string, iv: string) {
  if (!rawText || !privateKey || !iv) {
    console.log("decrypt() -> Missing arguments.");
    return;
  }

  try {
    const hashedPrivateKey = crypto
      .createHash("SHA256")
      .update(privateKey)
      .digest();

    const ivBuffer = Buffer.from(iv, "hex");

    const cipher = crypto.createCipheriv(algorithm, hashedPrivateKey, ivBuffer);

    let encrypted = cipher.update(rawText, "utf8", "hex");

    encrypted += cipher.final("hex");

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

    const ivBuffer = Buffer.from(iv, "hex");

    const decipher = crypto.createDecipheriv(
      algorithm,
      hashedPrivateKey,
      ivBuffer
    );

    let decrypted = decipher.update(cipherText, "hex", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (e) {
    console.log("decrypt() - Failed to decrypt: " + e);
  }
}
