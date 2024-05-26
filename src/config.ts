export const relativePath = {
  tail: "./src/database/entries/tail.json",
  tailBackup: "./src/database/entries/tail_backup.json",
  entry: (entryId: string) => `./src/database/entries/${entryId}.json`,
  entryBackup: (entryId: string) =>
    `./src/database/entries/${entryId}_backup.json`,
};
