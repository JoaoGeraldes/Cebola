import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Entry } from "./database-model.js";
import { createId } from "@paralleldrive/cuid2";

export class Cebola {
  static async createEntry(
    obj: Omit<Entry, "date" | "previousEntryId" | "nextEntryId" | "keywords">
  ) {
    const uniqueID = createId();
    const filePath = absolutePath(`./database/entries/${uniqueID}.json`);

    try {
      const lastInsertedEntryId = await this.getLastInsertedEntryId();

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

      // Update the lastInsertedEntryId to last-inserted-entry-id.json
      await this.updateLastInsertedEntryId(uniqueID);

      console.log(`JSON file created successfully at ${filePath}`);
    } catch (error) {
      console.error(`Error creating JSON file at ${filePath}:`, error.message);
      throw new Error(
        `createEntry() - Error creating JSON file at ${filePath}:`,
        error.message
      );
    }
  }

  static async updateEntry(entryId: string, updates: Partial<Entry>) {
    const filePath = absolutePath(`./database/entries/${entryId}.json`);

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
    } catch (error) {
      throw new Error(
        `updateEntry() - Error updating JSON file at ${filePath}:`,
        error.message
      );
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
      throw new Error(`Error deleting JSON file`);
    }
  }

  private static async updateLastInsertedEntryId(newId: string | null) {
    const filePath = absolutePath(`./database/last-inserted-entry-id.json`);

    try {
      const data = await fs.readFile(filePath, "utf8");
      const parsedData: Record<"lastInsertedEntryId", null | string> =
        JSON.parse(data);

      parsedData.lastInsertedEntryId = newId;

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(parsedData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      console.log(`Success updating LastInsertedEntryId at ${filePath}`);
    } catch (error) {
      console.log(
        `updateLastInsertedEntryId() - Error updating LastInsertedEntryId JSON file at ${filePath}:`
      );
      throw new Error(
        `updateLastInsertedEntryId() - Error updating LastInsertedEntryId JSON file at ${filePath}:`,
        error.message
      );
    }
  }

  static async getLastInsertedEntryId() {
    const pathToFile = absolutePath("./database/last-inserted-entry-id.json");

    try {
      const data = await fs.readFile(pathToFile, "utf8");
      const parsedData: Record<"lastInsertedEntryId", null | string> =
        JSON.parse(data);

      return parsedData.lastInsertedEntryId;
    } catch (error) {
      console.error(`Error reading JSON file at ${pathToFile}:`, error.message);
      throw `getLastInsertedEntryId() - ${error}`;
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

Cebola.deleteEntry("nwpxaji7hr2mxbu7akr9e18s");

// Utils
function absolutePath(relativeFilePath: string) {
  try {
    // Convert import.meta.url to a file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Construct the absolute file path
    const absoluteFilePath = path.join(__dirname, relativeFilePath);
    return absoluteFilePath;
  } catch {
    console.log("absolutePath() - Failed to calculate absolute path.");
    throw new Error("Failed to calculate absolute path.");
  }
}
