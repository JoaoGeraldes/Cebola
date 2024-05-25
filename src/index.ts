import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseState, Entry } from "./database-model.js";
import { createId } from "@paralleldrive/cuid2";

export class Cebola {
  static async createEntry(
    obj: Omit<Entry, "date" | "previousEntryId" | "nextEntryId" | "keywords">,
    _id: string | null = null
  ) {
    if (!obj)
      throw new Error("createEntry() - Missing data. Can't create entry!");

    const uniqueID = _id ? _id : createId();
    const filePath = absolutePath(`./src/database/entries/${uniqueID}.json`);
    const lastInsertedEntryId = await this.getLastInsertedEntryId();

    if (lastInsertedEntryId) {
      await this.smartBackup(lastInsertedEntryId);
    }

    try {
      // Prepare Entry structure to be stored
      const newEntry: Entry = {
        domain: obj.domain,
        username: obj.username,
        password: obj.password,
        description: obj.description,
        nextEntryId: null,
        previousEntryId: lastInsertedEntryId ? lastInsertedEntryId : null,
        date: new Date().toISOString(),
        keywords: [],
        tail: uniqueID,
        head: null,
      };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newEntry, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      /* this.smartBackup(uniqueID); */

      // Link previous entry to this new entry
      if (lastInsertedEntryId) {
        await this.updateEntry(lastInsertedEntryId, {
          nextEntryId: uniqueID,
          tail: uniqueID,
        });
      }

      // Update the lastInsertedEntryId to database_state.json
      /* await this.updateLastInsertedEntryId(uniqueID); */

      // Remove previously created temporary (backup) files.
      /*   await this.deleteFile(temporaryDatabaseStateFile);
      if (lastInsertedEntryId) {
        await this.deleteFile(temporaryPreviousEntryFile);
      } */

      // Delete previously created backups
      /* await this.smartBackupDelete(uniqueID); */
      return true;
    } catch (error) {
      console.error(
        `createEntry() - Error creating JSON file at ${filePath}:`,
        error.message
      );
      throw error;
    }
  }

  static async getEntry(entryId: string) {
    const filePath = absolutePath(`./src/database/entries/${entryId}.json`);

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);
      return entryData;
    } catch (error) {
      console.log(`getEntry() - Failed to retrieve JSON file at ${filePath}:`);
      return false;
    }
  }

  static async updateEntry(entryId: string, updates: Partial<Entry>) {
    if (!entryId || !updates) {
      throw new Error("updateEntry() - Missing entryId or updates.");
    }

    const filePath = absolutePath(`./src/database/entries/${entryId}.json`);

    await this.smartBackup(entryId);

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);

      const newEntryData = { ...entryData, ...updates };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newEntryData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      // Delete previously created backups
      /* await this.smartBackupDelete(entryId); */
      return true;
    } catch (error) {
      console.log(`updateEntry() - Error updating JSON file at ${filePath}:`);
      throw error;
    }
  }

  static async deleteEntry(entryId: string) {
    if (!entryId) {
      throw new Error(`deleteEntry() - Invalid entryId -> ${entryId}`);
    }

    const entryToBeDeletedFilePath = absolutePath(
      `./src/database/entries/${entryId}.json`
    );

    const entryJSON = await fs.readFile(
      absolutePath(`./src/database/entries/${entryId}.json`),
      "utf8"
    );
    const entry: Partial<Entry> = JSON.parse(entryJSON);

    await this.smartBackup(entryId);

    try {
      const entryPosition = this.entryPosition(entry);

      switch (entryPosition) {
        case "single":
          await this.deleteFile(entryToBeDeletedFilePath);
          break;

        case "head":
          await this.updateEntry(entry.nextEntryId, {
            previousEntryId: null,
          });
          await this.deleteFile(entryToBeDeletedFilePath);
          break;

        case "body":
          await this.updateEntry(entry.previousEntryId, {
            nextEntryId: entry.nextEntryId,
          });
          await this.updateEntry(entry.nextEntryId, {
            previousEntryId: entry.previousEntryId,
          });
          await this.deleteFile(entryToBeDeletedFilePath);
          break;

        case "tail":
          await this.updateEntry(entry.previousEntryId, {
            nextEntryId: null,
            tail: entry.previousEntryId,
          });
          await this.deleteFile(entryToBeDeletedFilePath);
          break;

        default:
          break;
      }

      console.log("COULD DELETEEEEEEE", entryId);

      // Delete previously created backups
      /* await this.smartBackupDelete(entryId); */
      /* await this.deleteFile(`./src/database/entries/${entryId}_backup.json`); */
    } catch (error) {
      console.error(
        `deleteEntry() - Error deleting JSON file at ${entryToBeDeletedFilePath}:`,
        error.message
      );
      throw error;
    }
  }

  static async updateLastInsertedEntryId(newId: string | null) {
    const filePath = absolutePath(`./src/database/database_state.json`);
    try {
      if (newId === undefined) {
        throw new Error("Missing newId on updateLastInsertedEntryId()");
      }

      const data = await fs.readFile(filePath, "utf8");
      const parsedData: DatabaseState = JSON.parse(data);

      // Update with the latest entry id
      const newData: DatabaseState = { ...parsedData, last_entry_id: newId };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      console.log(`Success updating LastInsertedEntryId at ${filePath}`);
      return true;
    } catch (error) {
      console.log(
        `updateLastInsertedEntryId() - Error updating LastInsertedEntryId JSON file at ${filePath}:`
      );
      throw error;
    }
  }

  static async getLastInsertedEntryId(): Promise<string | null> {
    /*     const pathToFile = absolutePath("./src/database/database_state.json");

    try {
      const data = await fs.readFile(pathToFile, "utf8");
      const parsedData: DatabaseState = JSON.parse(data);

      return parsedData.last_entry_id;
    } catch (error) {
      console.error(`Error reading JSON file at ${pathToFile}:`, error.message);
      return false;
    } */

    return new Promise(async (resolve, reject) => {
      const dirPath = absolutePath("./src/database/entries/");
      try {
        const files = await fs.readdir(dirPath);

        if (files.length < 1) {
          resolve(null);
          return;
        }

        const filePath = absolutePath(`./src/database/entries/${files?.[0]}`);
        const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
        const data: Entry = JSON.parse(fileContent);

        if (data) {
          resolve(data.tail);
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
        console.error(err);
      }
    });
  }

  static async copyFile(source: string, destination: string) {
    try {
      await fs.copyFile(source, destination);
      console.log(`${source} was copied to ${destination}`);
      return true;
    } catch (error) {
      console.error("Error copying file:", error);
      throw error.message;
    }
  }

  static async deleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
      console.log(`${filePath} was deleted successfully`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  /**
   *
   * @param entryId
   *
   * Creates backups of all files that are linked to a given entry
   */
  static async smartBackup(entryId: string) {
    try {
      if (!entryId) throw new Error("Missing entry ID");

      const entryJSON = await fs.readFile(
        absolutePath(`./src/database/entries/${entryId}.json`),
        "utf8"
      );

      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        entryFile: {
          original: `./src/database/entries/${entryId}.json`,
          backup: `./src/database/entries/${entryId}_backup.json`,
        },
        previousEntryFile: {
          original: `./src/database/entries/${entry.previousEntryId}.json`,
          backup: `./src/database/entries/${entry.previousEntryId}_backup.json`,
        },
        nextEntryFile: {
          original: `./src/database/entries/${entry.nextEntryId}.json`,
          backup: `./src/database/entries/${entry.nextEntryId}_backup.json`,
        },
      };

      switch (this.entryPosition(entry)) {
        case "single":
          await this.copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );
          break;
        case "head":
          await this.copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await this.copyFile(
            filesPath.nextEntryFile.original,
            filesPath.nextEntryFile.backup
          );
          break;
        case "body":
          await this.copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await this.copyFile(
            filesPath.previousEntryFile.original,
            filesPath.previousEntryFile.backup
          );

          await this.copyFile(
            filesPath.nextEntryFile.original,
            filesPath.nextEntryFile.backup
          );
          break;
        case "tail":
          await this.copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await this.copyFile(
            filesPath.previousEntryFile.original,
            filesPath.previousEntryFile.backup
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.trace("smartBackup() - failed to create backups.", error.message);
      throw error;
    }
  }

  /**
   *
   * @param entryId
   * The files linked to a given entry are modified to its previous state (which is held by _backup.json files)
   * Execute this to recover from previous state after a failure on any write (create or update) on entry(ies)
   */
  static async recoverFromSmartBackup(entryId: string) {
    try {
      const entryJSON = await fs.readFile(
        absolutePath(`./src/database/entries/${entryId}.json`),
        "utf8"
      );
      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        databaseStateFile: {
          original: "./src/database/database_state.json",
          backup: "./src/database/database_state_backup.json",
        },
        entryFile: {
          original: `./src/database/entries/${entryId}.json`,
          backup: `./src/database/entries/${entryId}_backup.json`,
        },
        previousEntryFile: {
          original: `./src/database/entries/${entry.previousEntryId}.json`,
          backup: `./src/database/entries/${entry.previousEntryId}_backup.json`,
        },
        nextEntryFile: {
          original: `./src/database/entries/${entry.nextEntryId}.json`,
          backup: `./src/database/entries/${entry.nextEntryId}_backup.json`,
        },
      };

      switch (this.entryPosition(entry)) {
        case "single":
          await this.copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          break;

        case "head":
          await this.copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await this.copyFile(
            filesPath.nextEntryFile.backup,
            filesPath.nextEntryFile.original
          );

          break;

        case "body":
          await this.copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await this.copyFile(
            filesPath.previousEntryFile.backup,
            filesPath.previousEntryFile.original
          );

          await this.copyFile(
            filesPath.nextEntryFile.backup,
            filesPath.nextEntryFile.original
          );

          break;

        case "tail":
          await this.copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await this.copyFile(
            filesPath.previousEntryFile.backup,
            filesPath.previousEntryFile.original
          );

          break;

        default:
          break;
      }
    } catch (error) {
      console.log(
        "recoverFromSmartBackup() - Error resetting entry from backup.",
        error.message
      );
      throw error.message;
    }
  }

  static async smartBackupDelete(entryId: string) {
    try {
      if (!entryId) return;

      const entryJSON = await fs.readFile(
        absolutePath(`./src/database/entries/${entryId}.json`),
        "utf8"
      );
      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        entryFile: {
          backup: `./src/database/entries/${entryId}_backup.json`,
        },
        previousEntryFile: {
          backup: `./src/database/entries/${entry.previousEntryId}_backup.json`,
        },
        nextEntryFile: {
          backup: `./src/database/entries/${entry.nextEntryId}_backup.json`,
        },
      };

      await this.deleteFile(filesPath.entryFile.backup);

      /*    switch (this.entryPosition(entry)) {
        case "single":
          await this.deleteFile(filesPath.entryFile.backup);

          break;

        case "head":
          await this.deleteFile(filesPath.entryFile.backup);
          await this.deleteFile(filesPath.nextEntryFile.backup);

          break;

        case "body":
          await this.deleteFile(filesPath.entryFile.backup);
          await this.deleteFile(filesPath.previousEntryFile.backup);
          await this.deleteFile(filesPath.nextEntryFile.backup);

          break;

        case "tail":
          await this.deleteFile(filesPath.entryFile.backup);
          await this.deleteFile(filesPath.previousEntryFile.backup);

          break;

        default:
          break;
      } */
    } catch (error) {
      console.log(
        "smartBackupDelete() - Error deleting backup!",
        error.message
      );
      throw error.message;
    }
  }

  static entryPosition(
    entry: Partial<Entry>
  ): "single" | "head" | "body" | "tail" {
    const isSingleEntry =
      entry.previousEntryId === null && entry.nextEntryId === null;

    const isHead = entry.previousEntryId === null;

    const isBody = entry.previousEntryId && entry.nextEntryId;

    const isTail = entry.previousEntryId && entry.nextEntryId === null;

    if (isSingleEntry) return "single";
    if (isHead) return "head";
    if (isBody) return "body";
    if (isTail) return "tail";
  }
}

/* const lastEntryId = Cebola.getLastEntryId().then((sd) =>
  console.log("lastEntryId", sd)
);
 */
/* Cebola.createEntry({
  domain: "a.com",
  password: "pwd123",
  username: "username",
  description: "some description here",
}); */

/* Cebola.deleteEntry("nwpxaji7hr2mxbu7akr9e18s"); */

// Utils
function absolutePath(relativeFilePath: string) {
  try {
    const absoluteFilePath = path.resolve(relativeFilePath);

    return absoluteFilePath;
  } catch {
    console.log("absolutePath() - Failed to calculate absolute path.");
    throw new Error("Failed to calculate absolute path.");
  }
}

/* Cebola.createEntry(
  {
    domain: "entry1",
    password: "entry1",
    username: "entry1",
    description: "entry1",
  },
  "entry1"
).then(() => {
  Cebola.createEntry(
    {
      domain: "entry2",
      password: "entry2",
      username: "entry2",
      description: "entry2",
    },
    "entry2"
  ).then(() => {
    Cebola.createEntry(
      {
        domain: "entry3",
        password: "entry3",
        username: "entry3",
        description: "entry3",
      },
      "entry3"
    );
  });
}); */

/* Cebola.deleteEntry("entry1").then(() => {
  Cebola.deleteEntry("entry2").then(() => {
    Cebola.deleteEntry("entry3");
  });
}); */
/* Cebola.deleteEntry("entry1"); */

/* async function test() {
  const id = await Cebola.getLastInsertedEntryId();
  console.log("getLastInsertedEntryId", id);
}
test(); */
