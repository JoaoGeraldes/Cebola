import { auth } from "../../config.ts";
import { decrypt, encrypt } from "../crypto.ts";
import crypto from "crypto";

describe("Crypto utilities", () => {
  it("Plaintext should match decrypted text.", async () => {
    const plaintext = "MyPassword!#$%&/()=?»1234567890";
    const privateKey = `${auth.adminCredentials.username}+${auth.adminCredentials.password}`;
    const iv = crypto.randomBytes(16).toString("hex");
    const cipherText = encrypt(plaintext, privateKey, iv);

    const decipheredText = decrypt(cipherText, privateKey, iv);

    expect(plaintext).toEqual(decipheredText);
  });
});
