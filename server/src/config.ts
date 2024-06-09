export const relativePath = {
  entries: "./database/entries/",
  tail: "./database/entries/tail.json",
  tailBackup: "./database/entries/tail_backup.json",
  entry: (entryId: string) => `./database/entries/${entryId}.json`,
  entryBackup: (entryId: string) => `./database/entries/${entryId}_backup.json`,
};

export const auth = {
  /**  Secret key for JWT */
  secretKey: "server_secret_key",
  /** Token duration - how long before it expires */
  tokenExpiresIn: "1h",
  /** Your credentials (to generate JWT) */
  adminCredentials: {
    id: 123456890,
    username: "john",
    password: "doe",
  },
};
