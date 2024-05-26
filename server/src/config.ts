export const relativePath = {
  entries: "./database/entries/",
  tail: "./database/entries/tail.json",
  tailBackup: "./database/entries/tail_backup.json",
  entry: (entryId: string) => `./database/entries/${entryId}.json`,
  entryBackup: (entryId: string) =>
    `./database/entries/${entryId}_backup.json`,
};
