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

    const originalDatabaseStateFile = "./src/database/database_state.json";
    const originalEntryFile = `./src/database/entries/${lastInsertedEntryId}.json`;
    const temporaryDatabaseStateFile =
      "./src/database/database_state_temp.json";
    const temporaryEntryFile = `./src/database/entries/${lastInsertedEntryId}_temp.json`;
    /* --------------------------------*/
    /* -------- CREATE BACKUPS --------*/
    /* --------------------------------*/
    try {
      // Create backup of previous entry before modification
      if (lastInsertedEntryId) {
        await this.copyFile(originalEntryFile, temporaryEntryFile);
      }

      // Create backup of the database_state.json file
      await this.copyFile(
        originalDatabaseStateFile,
        temporaryDatabaseStateFile
      );
    } catch (error) {
      console.log("createEntry() - failed to create backups.");
      throw error;
    }

    /* ------------------------------*/
    /* -------- CREATE ENTRY --------*/
    /* ------------------------------*/
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
      };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newEntry, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      // Link previous entry to this new entry
      if (lastInsertedEntryId) {
        await this.updateEntry(lastInsertedEntryId, {
          nextEntryId: uniqueID,
        });
      }

      // Update the lastInsertedEntryId to database_state.json
      await this.updateLastInsertedEntryId(uniqueID);

      // Remove previously created temporary (backup) files.
      await this.deleteFile(temporaryDatabaseStateFile);
      await this.deleteFile(temporaryEntryFile);

      console.log(`JSON file created successfully at ${filePath}`);
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
    const filePath = absolutePath(`./src/database/entries/${entryId}.json`);

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

      console.log(`JSON file updated successfully at ${filePath}`);
      return true;
    } catch (error) {
      console.log(`updateEntry() - Error updating JSON file at ${filePath}:`);
      throw error;
    }
  }

  static async deleteEntry(entryId: string) {
    const absoluteFilePath = absolutePath(`/database/entries/${entryId}.json`);

    try {
      const entryToBeDeletedJson = await fs.readFile(absoluteFilePath, "utf8");
      const entryToBeDeleted: Partial<Entry> = JSON.parse(entryToBeDeletedJson);

      const isTheFirstEntry = !entryToBeDeleted.previousEntryId; // Head
      const isTheLastEntry = !entryToBeDeleted.nextEntryId; // Tail
      const previousEntryId = entryToBeDeleted.previousEntryId;
      const nextEntryId = entryToBeDeleted.nextEntryId;
      const isTheOnlyEntry = !previousEntryId && !nextEntryId;

      // Delete the file
      await fs.unlink(absoluteFilePath);

      // Update entries linked to this one being deleted
      // Use-cases:
      //  1. Is the first entry, but has more entries.
      if (isTheFirstEntry && !isTheOnlyEntry) {
        await this.updateEntry(nextEntryId, { previousEntryId: null });
      }

      //  2. Only has one entry (has no previous nor next entry pointer)
      if (isTheOnlyEntry) {
        await this.updateLastInsertedEntryId(null);
      }

      //  3. Has multiple entries and this is the last entry (only has the previous entry pointer)
      if (isTheLastEntry && !isTheOnlyEntry) {
        await this.updateEntry(previousEntryId, { nextEntryId: null });
        await this.updateLastInsertedEntryId(previousEntryId);
      }

      //  4. This is somewhere in the middle (has previous and next entry pointers)
      if (!isTheLastEntry && !isTheOnlyEntry) {
        await this.updateEntry(previousEntryId, { nextEntryId: nextEntryId });
        await this.updateEntry(nextEntryId, {
          previousEntryId: previousEntryId,
        });
      }
      console.log(`JSON file deleted successfully at ${absoluteFilePath}`);
    } catch (error) {
      console.error(
        `deleteEntry() - Error deleting JSON file at ${absoluteFilePath}:`,
        error.message
      );
      throw error;
    }
  }

  static async updateLastInsertedEntryId(newId: string | null) {
    const filePath = absolutePath(`./src/database/database_state.json`);
    try {
      if (!newId) {
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

  static async getLastInsertedEntryId() {
    const pathToFile = absolutePath("./src/database/database_state.json");

    try {
      const data = await fs.readFile(pathToFile, "utf8");
      const parsedData: DatabaseState = JSON.parse(data);

      return parsedData.last_entry_id;
    } catch (error) {
      console.error(`Error reading JSON file at ${pathToFile}:`, error.message);
      return false;
    }
  }

  static async copyFile(source: string, destination: string) {
    try {
      await fs.copyFile(source, destination);
      console.log(`${source} was copied to ${destination}`);
      return true;
    } catch (error) {
      console.error("Error copying file:", error);
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
