export const relativePath = {
  entries: "./database/entries/",
  tail: "./database/entries/tail.json",
  tailBackup: "./database/entries/tail.bak",
  entry: (entryId: string) => `./database/entries/${entryId}.json`,
  entryBackup: (entryId: string) => `./database/entries/${entryId}.bak`,
  database: "./database",
  databaseBackup: () => {
    try {
      const datetime = new Date();
      const date = datetime.toLocaleDateString().replaceAll("/", "-");
      const time = datetime.toLocaleTimeString().replaceAll(":", ".");
      return `./bak/${date}_${time}_database.zip`;
    } catch {
      return `./bak/${Date.now()}_database.zip`;
    }
  },
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
