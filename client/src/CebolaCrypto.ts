export class CebolaCrypto {
  static async encrypt(plainText: string, plainTextPrivateKey: string) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM requires a 12-byte IV

    const derivedKey = await this.deriveKey(plainTextPrivateKey);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      derivedKey,
      encoder.encode(plainText)
    );

    return {
      iv: iv,
      cipher: new Uint8Array(encrypted),
      ivText: this.uint8ArrayToBase64(iv),
      cipherText: this.uint8ArrayToBase64(new Uint8Array(encrypted)),
    };
  }

  static async decrypt(
    cipherText: string,
    ivText: string,
    plainTextPrivateKey: string
  ) {
    try {
      const cipher = this.base64ToUint8Array(cipherText);
      const iv = this.base64ToUint8Array(ivText);
      const privateKey = await this.deriveKey(plainTextPrivateKey);

      const plainText = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        privateKey,
        cipher
      );

      const decoder = new TextDecoder();
      return decoder.decode(plainText);
    } catch (e) {
      throw new Error("Failed to decrypt. Additional information: " + e);
    }
  }

  // Derive a key from plain text using SHA-256
  private static async deriveKey(plainTextPrivateKey: string) {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(plainTextPrivateKey);
    const hash = await crypto.subtle.digest("SHA-256", keyMaterial);

    const privateKey = await crypto.subtle.importKey(
      "raw",
      hash,
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt", "decrypt"]
    );

    return privateKey;
  }

  private static uint8ArrayToBase64(uint8Array: unknown) {
    try {
      return btoa(String.fromCharCode.apply(null, uint8Array as number[]));
    } catch (e) {
      throw e;
    }
  }

  private static base64ToUint8Array(base64: string) {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      throw e;
    }
  }
}
